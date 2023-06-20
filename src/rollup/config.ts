import { pathToFileURL } from "node:url";
import { createRequire, builtinModules } from "node:module";
import { dirname, join, normalize, relative, resolve } from "pathe";
import type { InputOptions, OutputOptions, Plugin } from "rollup";
import { defu } from "defu";
// import terser from "@rollup/plugin-terser"; // TODO: Investigate jiti issue
import type { RollupWasmOptions } from "@rollup/plugin-wasm";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";
import wasmPlugin from "@rollup/plugin-wasm";
import inject from "@rollup/plugin-inject";
import { isWindows } from "std-env";
import { visualizer } from "rollup-plugin-visualizer";
import * as unenv from "unenv";
import type { Preset } from "unenv";
import { sanitizeFilePath, resolvePath } from "mlly";
import unimportPlugin from "unimport/unplugin";
import { hash } from "ohash";
import type { Nitro } from "../types";
import { resolveAliases } from "../utils";
import { runtimeDir } from "../dirs";
import { replace } from "./plugins/replace";
import { virtual } from "./plugins/virtual";
import { dynamicRequire } from "./plugins/dynamic-require";
import { externals } from "./plugins/externals";
import { externals as legacyExternals } from "./plugins/externals-legacy";
import { timing } from "./plugins/timing";
import { publicAssets } from "./plugins/public-assets";
import { serverAssets } from "./plugins/server-assets";
import { handlers } from "./plugins/handlers";
import { esbuild } from "./plugins/esbuild";
import { raw } from "./plugins/raw";
import { storage } from "./plugins/storage";
import { importMeta } from "./plugins/import-meta";
import { appConfig } from "./plugins/app-config";

export type RollupConfig = InputOptions & { output: OutputOptions };

export const getRollupConfig = (nitro: Nitro): RollupConfig => {
  const extensions: string[] = [".ts", ".mjs", ".js", ".json", ".node"];

  const nodePreset = nitro.options.node === false ? unenv.nodeless : unenv.node;

  const builtinPreset: Preset = {
    alias: {
      // General
      consola: "unenv/runtime/npm/consola",
      // only mock debug in production
      ...(nitro.options.dev ? {} : { debug: "unenv/runtime/npm/debug" }),
      ...nitro.options.alias,
    },
  };

  const env = unenv.env(nodePreset, builtinPreset, nitro.options.unenv);

  if (nitro.options.sourceMap) {
    env.polyfill.push("source-map-support/register.js");
  }

  const buildServerDir = join(nitro.options.buildDir, "dist/server");
  const runtimeAppDir = join(runtimeDir, "app");

  type _RollupConfig = Omit<RollupConfig, "plugins"> & { plugins: Plugin[] };

  const rollupConfig: _RollupConfig = defu(nitro.options.rollupConfig as any, <
    _RollupConfig
  >{
    input: nitro.options.entry,
    output: {
      dir: nitro.options.output.serverDir,
      entryFileNames: "index.mjs",
      chunkFileNames(chunkInfo) {
        let prefix = "";
        const lastModule = normalize(chunkInfo.moduleIds.at(-1));
        if (lastModule.startsWith(buildServerDir)) {
          prefix = join("app", relative(buildServerDir, dirname(lastModule)));
        } else if (lastModule.startsWith(runtimeAppDir)) {
          prefix = "app";
        } else if (lastModule.startsWith(nitro.options.buildDir)) {
          prefix = "build";
        } else if (lastModule.startsWith(runtimeDir)) {
          prefix = "nitro";
        } else if (
          nitro.options.handlers.some((m) =>
            lastModule.startsWith(m.handler as string)
          )
        ) {
          prefix = "handlers";
        } else if (
          lastModule.includes("assets") ||
          lastModule.startsWith("\0raw:")
        ) {
          prefix = "raw";
        } else if (lastModule.startsWith("\0")) {
          prefix = "rollup";
        }
        return join("chunks", prefix, "[name].mjs");
      },
      inlineDynamicImports: nitro.options.inlineDynamicImports,
      format: "esm",
      exports: "auto",
      intro: "",
      outro: "",
      generatedCode: {
        constBindings: true,
      },
      sanitizeFileName: sanitizeFilePath,
      sourcemap: nitro.options.sourceMap,
      sourcemapExcludeSources: true,
      sourcemapPathTransform(relativePath, sourcemapPath) {
        return resolve(dirname(sourcemapPath), relativePath);
      },
    },
    external: env.external,
    // https://github.com/rollup/rollup/pull/4021#issuecomment-809985618
    makeAbsoluteExternalsRelative: false,
    plugins: [],
    onwarn(warning, rollupWarn) {
      if (
        !["CIRCULAR_DEPENDENCY", "EVAL"].includes(warning.code) &&
        !warning.message.includes("Unsupported source map comment")
      ) {
        rollupWarn(warning);
      }
    },
    treeshake: {
      moduleSideEffects(id) {
        const normalizedId = normalize(id);
        const idWithoutNodeModules = normalizedId.split("node_modules/").pop();
        return nitro.options.moduleSideEffects.some(
          (m) =>
            normalizedId.startsWith(m) || idWithoutNodeModules.startsWith(m)
        );
      },
    },
  });

  if (nitro.options.timing) {
    rollupConfig.plugins.push(timing());
  }

  if (nitro.options.imports) {
    rollupConfig.plugins.push(
      unimportPlugin.rollup(nitro.options.imports) as Plugin
    );
  }

  // Raw asset loader
  rollupConfig.plugins.push(raw());

  // WASM import support
  if (nitro.options.experimental.wasm) {
    const options = {
      ...(nitro.options.experimental.wasm as RollupWasmOptions),
    };
    rollupConfig.plugins.push(wasmPlugin(options));
  }

  // Build-time environment variables
  let NODE_ENV = nitro.options.dev ? "development" : "production";
  if (nitro.options.preset === "nitro-prerender") {
    NODE_ENV = "prerender";
  }
  const buildEnvVars = {
    NODE_ENV,
    prerender: nitro.options.preset === "nitro-prerender",
    server: true,
    client: false,
    dev: String(nitro.options.dev),
    DEBUG: nitro.options.dev,
  };

  // Universal import.meta
  rollupConfig.plugins.push(importMeta(nitro));

  // https://github.com/rollup/plugins/tree/master/packages/replace
  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      values: {
        "typeof window": '"undefined"',
        _import_meta_url_: "import.meta.url",
        "process.env.RUNTIME_CONFIG": () =>
          JSON.stringify(nitro.options.runtimeConfig, null, 2),
        ...Object.fromEntries(
          [".", ";", ")", "[", "]", "}", " "].map((d) => [
            `import.meta${d}`,
            `globalThis._importMeta_${d}`,
          ])
        ),
        ...Object.fromEntries(
          [";", "(", "{", "}", " ", "\t", "\n"].map((d) => [
            `${d}global.`,
            `${d}globalThis.`,
          ])
        ),
        ...Object.fromEntries(
          Object.entries(buildEnvVars).map(([key, val]) => [
            `process.env.${key}`,
            JSON.stringify(val),
          ])
        ),
        ...Object.fromEntries(
          Object.entries(buildEnvVars).map(([key, val]) => [
            `import.meta.env.${key}`,
            JSON.stringify(val),
          ])
        ),
        ...nitro.options.replace,
      },
    })
  );

  // esbuild
  rollupConfig.plugins.push(
    esbuild({
      target: "es2019",
      sourceMap: nitro.options.sourceMap,
      ...nitro.options.esbuild?.options,
    })
  );

  // Dynamic Require Support
  rollupConfig.plugins.push(
    dynamicRequire({
      dir: resolve(nitro.options.buildDir, "dist/server"),
      inline:
        nitro.options.node === false || nitro.options.inlineDynamicImports,
      ignore: [
        "client.manifest.mjs",
        "server.js",
        "server.cjs",
        "server.mjs",
        "server.manifest.mjs",
      ],
    })
  );

  // Server assets
  rollupConfig.plugins.push(serverAssets(nitro));

  // Public assets
  rollupConfig.plugins.push(publicAssets(nitro));

  // Storage
  rollupConfig.plugins.push(storage(nitro));

  // App.config
  rollupConfig.plugins.push(appConfig(nitro));

  // Handlers
  rollupConfig.plugins.push(handlers(nitro));

  // Polyfill
  rollupConfig.plugins.push(
    virtual(
      {
        "#internal/nitro/virtual/polyfill": env.polyfill
          .map((p) => `import '${p}';`)
          .join("\n"),
      },
      nitro.vfs
    )
  );

  // User virtuals
  rollupConfig.plugins.push(virtual(nitro.options.virtual, nitro.vfs));

  // Plugins
  rollupConfig.plugins.push(
    virtual(
      {
        "#internal/nitro/virtual/plugins": `
${nitro.options.plugins
  .map((plugin) => `import _${hash(plugin)} from '${plugin}';`)
  .join("\n")}

export const plugins = [
  ${nitro.options.plugins.map((plugin) => `_${hash(plugin)}`).join(",\n")}
]
    `,
      },
      nitro.vfs
    )
  );

  // https://github.com/rollup/plugins/tree/master/packages/alias
  let buildDir = nitro.options.buildDir;
  // Windows (native) dynamic imports should be file:// urls
  if (
    isWindows &&
    nitro.options.externals?.trace === false &&
    nitro.options.dev
  ) {
    buildDir = pathToFileURL(buildDir).href;
  }
  rollupConfig.plugins.push(
    alias({
      entries: resolveAliases({
        "#build": buildDir,
        "#internal/nitro/virtual/error-handler": nitro.options.errorHandler,
        "~": nitro.options.srcDir,
        "@/": nitro.options.srcDir,
        "~~": nitro.options.rootDir,
        "@@/": nitro.options.rootDir,
        ...env.alias,
      }),
    })
  );

  // Externals Plugin
  if (nitro.options.noExternals) {
    rollupConfig.plugins.push({
      name: "no-externals",
      async resolveId(id, from, options) {
        if (
          nitro.options.node &&
          (id.startsWith("node:") || builtinModules.includes(id))
        ) {
          return { id, external: true };
        }
        const resolved = await this.resolve(id, from, {
          ...options,
          skipSelf: true,
        });
        if (!resolved) {
          const _resolved = await resolvePath(id, {
            url: nitro.options.nodeModulesDirs,
            conditions: [
              "default",
              nitro.options.dev ? "development" : "production",
              "module",
              "node",
              "import",
            ],
          }).catch(() => null);
          if (_resolved) {
            return { id: _resolved, external: false };
          }
        }
        if (!resolved || resolved.external) {
          throw new Error(
            `Cannot resolve ${JSON.stringify(id)} from ${JSON.stringify(
              from
            )} and externals are not allowed!`
          );
        }
      },
    });
  } else {
    const externalsPlugin = nitro.options.experimental.legacyExternals
      ? legacyExternals
      : externals;
    rollupConfig.plugins.push(
      externalsPlugin(
        defu(nitro.options.externals, {
          outDir: nitro.options.output.serverDir,
          moduleDirectories: nitro.options.nodeModulesDirs,
          external: [...(nitro.options.dev ? [nitro.options.buildDir] : [])],
          inline: [
            "#",
            "~",
            "@/",
            "~~",
            "@@/",
            "virtual:",
            runtimeDir,
            nitro.options.srcDir,
            ...nitro.options.handlers
              .map((m) => m.handler)
              .filter((i) => typeof i === "string"),
          ],
          traceOptions: {
            base: "/",
            processCwd: nitro.options.rootDir,
            exportsOnly: true,
          },
          exportConditions: [
            "default",
            nitro.options.dev ? "development" : "production",
            "module",
            "node",
            "import",
          ],
        })
      )
    );
  }

  // https://github.com/rollup/plugins/tree/master/packages/node-resolve
  rollupConfig.plugins.push(
    nodeResolve({
      extensions,
      preferBuiltins: !!nitro.options.node,
      rootDir: nitro.options.rootDir,
      modulePaths: nitro.options.nodeModulesDirs,
      // 'module' is intentionally not supported because of externals
      mainFields: ["main"],
      exportConditions: [
        "default",
        nitro.options.dev ? "development" : "production",
        "module",
        "node",
        "import",
      ],
    })
  );

  // Automatically mock unresolved externals
  // rollupConfig.plugins.push(autoMock())

  // https://github.com/rollup/plugins/tree/master/packages/commonjs
  rollupConfig.plugins.push(
    commonjs({
      esmExternals: (id) => !id.startsWith("unenv/"),
      requireReturnsDefault: "auto",
      ...nitro.options.commonJS,
    })
  );

  // https://github.com/rollup/plugins/tree/master/packages/json
  rollupConfig.plugins.push(json());

  // https://github.com/rollup/plugins/tree/master/packages/inject
  rollupConfig.plugins.push(inject(env.inject));

  // https://www.npmjs.com/package/@rollup/plugin-terser
  // https://github.com/terser/terser#minify-options
  if (nitro.options.minify) {
    const _terser = createRequire(import.meta.url)("@rollup/plugin-terser");
    const terser = _terser.default || _terser;
    rollupConfig.plugins.push(
      terser({
        mangle: {
          keep_fnames: true,
          keep_classnames: true,
        },
        format: {
          comments: false,
        },
      })
    );
  }

  if (nitro.options.analyze) {
    // https://github.com/btd/rollup-plugin-visualizer
    rollupConfig.plugins.push(
      visualizer({
        ...nitro.options.analyze,
        filename: nitro.options.analyze.filename.replace("{name}", "nitro"),
        title: "Nitro Server bundle stats",
      })
    );
  }

  return rollupConfig;
};
