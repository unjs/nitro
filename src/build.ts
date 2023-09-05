import { existsSync, promises as fsp } from "node:fs";
import { relative, resolve, join, dirname, isAbsolute } from "pathe";
import { resolveAlias } from "pathe/utils";
import * as rollup from "rollup";
import fse from "fs-extra";
import { defu } from "defu";
import { watch } from "chokidar";
import { genTypeImport } from "knitwork";
import { debounce } from "perfect-debounce";
import type { TSConfig } from "pkg-types";
import type { RollupError } from "rollup";
import type { OnResolveResult, PartialMessage } from "esbuild";
import type { RouterMethod } from "h3";
import { globby } from "globby";
import {
  lookupNodeModuleSubpath,
  parseNodeModulePath,
  resolvePath,
} from "mlly";
import { generateFSTree } from "./utils/tree";
import { getRollupConfig, RollupConfig } from "./rollup/config";
import { prettyPath, writeFile, isDirectory } from "./utils";
import { GLOB_SCAN_PATTERN, scanHandlers } from "./scan";
import type { Nitro } from "./types";
import { runtimeDir } from "./dirs";
import { snapshotStorage } from "./storage";
import { compressPublicAssets } from "./compress";

export async function prepare(nitro: Nitro) {
  await prepareDir(nitro.options.output.dir);
  if (!nitro.options.noPublicDir) {
    await prepareDir(nitro.options.output.publicDir);
  }
  if (!nitro.options.static) {
    await prepareDir(nitro.options.output.serverDir);
  }
}

async function prepareDir(dir: string) {
  await fsp.mkdir(dir, { recursive: true });
  await fse.emptyDir(dir);
}

export async function copyPublicAssets(nitro: Nitro) {
  if (nitro.options.noPublicDir) {
    return;
  }
  for (const asset of nitro.options.publicAssets) {
    const srcDir = asset.dir;
    const dstDir = join(nitro.options.output.publicDir, asset.baseURL!);
    if (await isDirectory(srcDir)) {
      const publicAssets = await globby("**", {
        cwd: srcDir,
        absolute: false,
        dot: true,
        ignore: nitro.options.ignore
          .map((p) =>
            p.startsWith("*") || p.startsWith("!*")
              ? p
              : relative(srcDir, resolve(nitro.options.srcDir, p))
          )
          .filter((p) => !p.startsWith("../")),
      });
      await Promise.all(
        publicAssets.map(async (file) => {
          const src = join(srcDir, file);
          const dst = join(dstDir, file);
          if (!existsSync(dst)) {
            await fsp.cp(src, dst);
          }
        })
      );
    }
  }
  if (nitro.options.compressPublicAssets) {
    await compressPublicAssets(nitro);
  }
  nitro.logger.success(
    "Generated public " + prettyPath(nitro.options.output.publicDir)
  );
}

export async function build(nitro: Nitro) {
  const rollupConfig = getRollupConfig(nitro);
  await nitro.hooks.callHook("rollup:before", nitro, rollupConfig);
  return nitro.options.dev
    ? _watch(nitro, rollupConfig)
    : _build(nitro, rollupConfig);
}

export async function writeTypes(nitro: Nitro) {
  const routeTypes: Record<
    string,
    Partial<Record<RouterMethod | "default", string[]>>
  > = {};

  const typesDir = resolve(nitro.options.buildDir, "types");

  const middleware = [...nitro.scannedHandlers, ...nitro.options.handlers];

  for (const mw of middleware) {
    if (typeof mw.handler !== "string" || !mw.route) {
      continue;
    }
    const relativePath = relative(typesDir, mw.handler).replace(
      /\.[a-z]+$/,
      ""
    );

    if (!routeTypes[mw.route]) {
      routeTypes[mw.route] = {};
    }

    const method = mw.method || "default";
    if (!routeTypes[mw.route][method]) {
      routeTypes[mw.route][method] = [];
    }
    routeTypes[mw.route][method].push(
      `Simplify<Serialize<Awaited<ReturnType<typeof import('${relativePath}').default>>>>`
    );
  }

  let autoImportedTypes: string[] = [];
  let autoImportExports: string;

  if (nitro.unimport) {
    await nitro.unimport.init();
    // TODO: fully resolve utils exported from `#imports`
    autoImportExports = await nitro.unimport
      .toExports(typesDir)
      .then((r) =>
        r.replace(/#internal\/nitro/g, relative(typesDir, runtimeDir))
      );

    const resolvedImportPathMap = new Map<string, string>();
    const imports = await nitro.unimport
      .getImports()
      .then((r) => r.filter((i) => !i.type));

    for (const i of imports) {
      if (resolvedImportPathMap.has(i.from)) {
        continue;
      }
      let path = resolveAlias(i.from, nitro.options.alias);
      if (!isAbsolute(path)) {
        const resolvedPath = await resolvePath(i.from, {
          url: nitro.options.nodeModulesDirs,
        }).catch(() => null);
        if (resolvedPath) {
          const { dir, name } = parseNodeModulePath(resolvedPath);
          if (!dir || !name) {
            path = resolvedPath;
          } else {
            const subpath = await lookupNodeModuleSubpath(resolvedPath);
            path = join(dir, name, subpath || "");
          }
        }
      }
      if (existsSync(path) && !isDirectory(path)) {
        path = path.replace(/\.[a-z]+$/, "");
      }
      if (isAbsolute(path)) {
        path = relative(typesDir, path);
      }
      resolvedImportPathMap.set(i.from, path);
    }

    autoImportedTypes = [
      (
        await nitro.unimport.generateTypeDeclarations({
          exportHelper: false,
          resolvePath: (i) => resolvedImportPathMap.get(i.from) ?? i.from,
        })
      ).trim(),
    ];
  }

  const routes = [
    "// Generated by nitro",
    "import type { Serialize, Simplify } from 'nitropack'",
    "declare module 'nitropack' {",
    "  type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T",
    "  interface InternalApi {",
    ...Object.entries(routeTypes).map(([path, methods]) =>
      [
        `    '${path}': {`,
        ...Object.entries(methods).map(
          ([method, types]) => `      '${method}': ${types.join(" | ")}`
        ),
        "    }",
      ].join("\n")
    ),
    "  }",
    "}",
    // Makes this a module for augmentation purposes
    "export {}",
  ];

  const config = [
    "// Generated by nitro",
    `
// App Config
import type { Defu } from 'defu'

${nitro.options.appConfigFiles
  .map((file, index) =>
    genTypeImport(file.replace(/\.\w+$/, ""), [
      { name: "default", as: `appConfig${index}` },
    ])
  )
  .join("\n")}

type UserAppConfig = Defu<{}, [${nitro.options.appConfigFiles
      .map((_, index: number) => `typeof appConfig${index}`)
      .join(", ")}]>

declare module 'nitropack' {
  interface AppConfig extends UserAppConfig {}
}
    `,
    // Makes this a module for augmentation purposes
    "export {}",
  ];

  const declarations = [
    // local nitropack augmentations
    '/// <reference path="./nitro-routes.d.ts" />',
    '/// <reference path="./nitro-config.d.ts" />',
    // global server auto-imports
    '/// <reference path="./nitro-imports.d.ts" />',
  ];

  const buildFiles: { path: string; contents: string }[] = [];

  buildFiles.push({
    path: join(typesDir, "nitro-routes.d.ts"),
    contents: routes.join("\n"),
  });

  buildFiles.push({
    path: join(typesDir, "nitro-config.d.ts"),
    contents: config.join("\n"),
  });

  buildFiles.push({
    path: join(typesDir, "nitro-imports.d.ts"),
    contents: [...autoImportedTypes, autoImportExports || "export {}"].join(
      "\n"
    ),
  });

  buildFiles.push({
    path: join(typesDir, "nitro.d.ts"),
    contents: declarations.join("\n"),
  });

  if (nitro.options.typescript.generateTsConfig) {
    const tsConfigPath = resolve(
      nitro.options.buildDir,
      nitro.options.typescript.tsconfigPath
    );
    const tsconfigDir = dirname(tsConfigPath);
    const tsConfig: TSConfig = defu(nitro.options.typescript.tsConfig, {
      compilerOptions: {
        forceConsistentCasingInFileNames: true,
        strict: nitro.options.typescript.strict,
        target: "ESNext",
        module: "ESNext",
        moduleResolution: nitro.options.experimental.typescriptBundlerResolution
          ? "Bundler"
          : "Node",
        allowJs: true,
        resolveJsonModule: true,
        jsx: "preserve",
        allowSyntheticDefaultImports: true,
        jsxFactory: "h",
        jsxFragmentFactory: "Fragment",
        paths: {
          "#imports": [
            relativeWithDot(tsconfigDir, join(typesDir, "nitro-imports")),
          ],
          ...(nitro.options.typescript.internalPaths
            ? {
                "#internal/nitro": [
                  relativeWithDot(tsconfigDir, join(runtimeDir, "index")),
                ],
                "#internal/nitro/*": [
                  relativeWithDot(tsconfigDir, join(runtimeDir, "*")),
                ],
              }
            : {}),
        },
      },
      include: [
        relativeWithDot(tsconfigDir, join(typesDir, "nitro.d.ts")).replace(
          /^(?=[^.])/,
          "./"
        ),
        join(relativeWithDot(tsconfigDir, nitro.options.rootDir), "**/*"),
        ...(nitro.options.srcDir === nitro.options.rootDir
          ? []
          : [join(relativeWithDot(tsconfigDir, nitro.options.srcDir), "**/*")]),
      ],
    });

    for (const alias in tsConfig.compilerOptions!.paths) {
      const paths = tsConfig.compilerOptions!.paths[alias];
      tsConfig.compilerOptions!.paths[alias] = await Promise.all(
        paths.map(async (path: string) => {
          if (!isAbsolute(path)) {
            return path;
          }
          const stats = await fsp
            .stat(path)
            .catch(() => null /* file does not exist */);
          return relativeWithDot(
            tsconfigDir,
            stats?.isFile()
              ? path.replace(/(?<=\w)\.\w+$/g, "") /* remove extension */
              : path
          );
        })
      );
    }

    tsConfig.include = [
      ...new Set(
        tsConfig.include.map((p) =>
          isAbsolute(p) ? relativeWithDot(tsconfigDir, p) : p
        )
      ),
    ];
    if (tsConfig.exclude) {
      tsConfig.exclude = [
        ...new Set(
          tsConfig.exclude!.map((p) =>
            isAbsolute(p) ? relativeWithDot(tsconfigDir, p) : p
          )
        ),
      ];
    }

    buildFiles.push({
      path: tsConfigPath,
      contents: JSON.stringify(tsConfig, null, 2),
    });
  }

  await Promise.all(
    buildFiles.map(async (file) => {
      await writeFile(
        resolve(nitro.options.buildDir, file.path),
        file.contents
      );
    })
  );
}

async function _snapshot(nitro: Nitro) {
  if (
    nitro.options.bundledStorage.length === 0 ||
    nitro.options.preset === "nitro-prerender"
  ) {
    return;
  }
  // TODO: Use virtual storage for server assets
  const storageDir = resolve(nitro.options.buildDir, "snapshot");
  nitro.options.serverAssets.push({
    baseName: "nitro:bundled",
    dir: storageDir,
  });

  const data = await snapshotStorage(nitro);
  await Promise.all(
    Object.entries(data).map(async ([path, contents]) => {
      if (typeof contents !== "string") {
        contents = JSON.stringify(contents);
      }
      const fsPath = join(storageDir, path.replace(/:/g, "/"));
      await fsp.mkdir(dirname(fsPath), { recursive: true });
      await fsp.writeFile(fsPath, contents, "utf8");
    })
  );
}

async function _build(nitro: Nitro, rollupConfig: RollupConfig) {
  await scanHandlers(nitro);
  await writeTypes(nitro);
  await _snapshot(nitro);

  if (!nitro.options.static) {
    nitro.logger.info(
      `Building Nitro Server (preset: \`${nitro.options.preset}\`)`
    );
    const build = await rollup.rollup(rollupConfig).catch((error) => {
      nitro.logger.error(formatRollupError(error));
      throw error;
    });

    await build.write(rollupConfig.output);
  }

  // Write build info
  const nitroConfigPath = resolve(nitro.options.output.dir, "nitro.json");
  const buildInfo = {
    date: new Date(),
    preset: nitro.options.preset,
    entry: nitro.options.entry.split("/").pop(),
    commands: {
      preview: nitro.options.commands.preview,
      deploy: nitro.options.commands.deploy,
    },
  };
  await writeFile(nitroConfigPath, JSON.stringify(buildInfo, null, 2));

  if (!nitro.options.static) {
    nitro.logger.success("Nitro server built");
    if (nitro.options.logLevel > 1) {
      process.stdout.write(
        await generateFSTree(nitro.options.output.serverDir)
      );
    }
  }

  await nitro.hooks.callHook("compiled", nitro);

  // Show deploy and preview hints
  const rOutput = relative(process.cwd(), nitro.options.output.dir);
  const rewriteRelativePaths = (input: string) => {
    return input.replace(/\s\.\/(\S*)/g, ` ${rOutput}/$1`);
  };
  if (buildInfo.commands.preview) {
    nitro.logger.success(
      `You can preview this build using \`${rewriteRelativePaths(
        buildInfo.commands.preview
      )}\``
    );
  }
  if (buildInfo.commands.deploy) {
    nitro.logger.success(
      `You can deploy this build using \`${rewriteRelativePaths(
        buildInfo.commands.deploy
      )}\``
    );
  }
}

function startRollupWatcher(nitro: Nitro, rollupConfig: RollupConfig) {
  const watcher = rollup.watch(
    defu(rollupConfig, {
      watch: {
        chokidar: nitro.options.watchOptions,
      },
    })
  );
  let start: number;

  watcher.on("event", (event) => {
    switch (event.code) {
      // The watcher is (re)starting
      case "START": {
        return;
      }

      // Building an individual bundle
      case "BUNDLE_START": {
        start = Date.now();
        return;
      }

      // Finished building all bundles
      case "END": {
        nitro.hooks.callHook("compiled", nitro);
        nitro.logger.success(
          "Nitro built",
          start ? `in ${Date.now() - start} ms` : ""
        );
        nitro.hooks.callHook("dev:reload");
        return;
      }

      // Encountered an error while bundling
      case "ERROR": {
        nitro.logger.error(formatRollupError(event.error));
      }
    }
  });
  return watcher;
}

async function _watch(nitro: Nitro, rollupConfig: RollupConfig) {
  let rollupWatcher: rollup.RollupWatcher;

  async function load() {
    if (rollupWatcher) {
      await rollupWatcher.close();
    }
    await scanHandlers(nitro);
    rollupWatcher = startRollupWatcher(nitro, rollupConfig);
    await writeTypes(nitro);
  }
  const reload = debounce(load);

  const watchPatterns = nitro.options.scanDirs.flatMap((dir) => [
    join(dir, "api"),
    join(dir, "routes"),
    join(dir, "middleware", GLOB_SCAN_PATTERN),
  ]);

  const watchReloadEvents = new Set(["add", "addDir", "unlink", "unlinkDir"]);
  const reloadWatcher = watch(watchPatterns, { ignoreInitial: true }).on(
    "all",
    (event) => {
      if (watchReloadEvents.has(event)) {
        reload();
      }
    }
  );

  nitro.hooks.hook("close", () => {
    rollupWatcher.close();
    reloadWatcher.close();
  });

  nitro.hooks.hook("rollup:reload", () => reload());

  await load();
}

function formatRollupError(_error: RollupError | OnResolveResult) {
  try {
    const logs: string[] = [_error.toString()];
    for (const error of "errors" in _error
      ? _error.errors
      : [_error as RollupError]) {
      const id = (error as any).path || error.id || (_error as RollupError).id;
      let path = isAbsolute(id) ? relative(process.cwd(), id) : id;
      const location =
        (error as RollupError).loc || (error as PartialMessage).location;
      if (location) {
        path += `:${location.line}:${location.column}`;
      }
      const text =
        (error as PartialMessage).text || (error as RollupError).frame;
      logs.push(
        `Rollup error while processing \`${path}\`` + text ? "\n\n" + text : ""
      );
    }
    return logs.join("\n");
  } catch {
    return _error?.toString();
  }
}

const RELATIVE_RE = /^\.{1,2}\//;
function relativeWithDot(from: string, to: string) {
  const rel = relative(from, to);
  return RELATIVE_RE.test(rel) ? rel : "./" + rel;
}
