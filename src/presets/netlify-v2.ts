import { existsSync, promises as fsp } from "node:fs";
import { join, dirname } from "pathe";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";
import { version } from "../../package.json";

// Netlify functions
export const netlify = defineNitroPreset({
  entry: "#internal/nitro/entries/netlify-v2",
  output: {
    dir: "{{ rootDir }}/.netlify/functions-internal",
    publicDir: "{{ rootDir }}/dist",
  },
  rollupConfig: {
    output: {
      entryFileNames: "main.mjs",
    },
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await writeHeaders(nitro);
      await writeRedirects(nitro);

      await fsp.writeFile(
        join(nitro.options.output.dir, "server", "server.mjs"),
        generateNetlifyFunction(nitro)
      );

      if (nitro.options.netlify) {
        const configPath = join(
          nitro.options.output.dir,
          "../deploy/v1/config.json"
        );
        await fsp.mkdir(dirname(configPath), { recursive: true });
        await fsp.writeFile(
          configPath,
          JSON.stringify(nitro.options.netlify),
          "utf8"
        );
      }
    },
  },
});

// Netlify edge
export const netlifyEdge = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/netlify-edge",
  exportConditions: ["netlify"],
  output: {
    serverDir: "{{ rootDir }}/.netlify/edge-functions/server",
    publicDir: "{{ rootDir }}/dist",
  },
  rollupConfig: {
    output: {
      entryFileNames: "server.js",
      format: "esm",
    },
  },
  unenv: {
    polyfill: ["#internal/nitro/polyfill/deno-env"],
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await writeHeaders(nitro);
      await writeRedirects(nitro);

      // https://docs.netlify.com/edge-functions/create-integration/
      const manifest = {
        version: 1,
        functions: [
          {
            path: "/*",
            name: "edge server handler",
            function: "server",
            generator: getGeneratorString(nitro),
          },
        ],
      };
      const manifestPath = join(
        nitro.options.rootDir,
        ".netlify/edge-functions/manifest.json"
      );
      await fsp.mkdir(dirname(manifestPath), { recursive: true });
      await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    },
  },
});

export const netlifyStatic = defineNitroPreset({
  extends: "static",
  output: {
    publicDir: "{{ rootDir }}/dist",
  },
  commands: {
    preview: "npx serve ./static",
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await writeHeaders(nitro);
      await writeRedirects(nitro);
    },
  },
});

async function writeRedirects(nitro: Nitro) {
  const redirectsPath = join(nitro.options.output.publicDir, "_redirects");

  let contents = "";
  if (nitro.options.static) {
    const staticFallback = existsSync(
      join(nitro.options.output.publicDir, "404.html")
    )
      ? "/* /404.html 404"
      : "";
    contents += staticFallback;
  }

  const rules = Object.entries(nitro.options.routeRules).sort(
    (a, b) => a[0].split(/\/(?!\*)/).length - b[0].split(/\/(?!\*)/).length
  );

  for (const [key, routeRules] of rules.filter(
    ([_, routeRules]) => routeRules.redirect
  )) {
    let code = routeRules.redirect!.statusCode;
    // TODO: Remove map when netlify support 307/308
    if (code === 307) {
      code = 302;
    }
    if (code === 308) {
      code = 301;
    }
    contents =
      `${key.replace("/**", "/*")}\t${routeRules.redirect!.to.replace(
        "/**",
        "/:splat"
      )}\t${code}\n` + contents;
  }

  if (existsSync(redirectsPath)) {
    const currentRedirects = await fsp.readFile(redirectsPath, "utf8");
    if (/^\/\* /m.test(currentRedirects)) {
      nitro.logger.info(
        "Not adding Nitro fallback to `_redirects` (as an existing fallback was found)."
      );
      return;
    }
    nitro.logger.info(
      "Adding Nitro fallback to `_redirects` to handle all unmatched routes."
    );
    contents = currentRedirects + "\n" + contents;
  }

  await fsp.writeFile(redirectsPath, contents);
}

async function writeHeaders(nitro: Nitro) {
  const headersPath = join(nitro.options.output.publicDir, "_headers");
  let contents = "";

  const rules = Object.entries(nitro.options.routeRules).sort(
    (a, b) => b[0].split(/\/(?!\*)/).length - a[0].split(/\/(?!\*)/).length
  );

  for (const [path, routeRules] of rules.filter(
    ([_, routeRules]) => routeRules.headers
  )) {
    const headers = [
      path.replace("/**", "/*"),
      ...Object.entries({ ...routeRules.headers }).map(
        ([header, value]) => `  ${header}: ${value}`
      ),
    ].join("\n");

    contents += headers + "\n";
  }

  if (existsSync(headersPath)) {
    const currentHeaders = await fsp.readFile(headersPath, "utf8");
    if (/^\/\* /m.test(currentHeaders)) {
      nitro.logger.info(
        "Not adding Nitro fallback to `_headers` (as an existing fallback was found)."
      );
      return;
    }
    nitro.logger.info(
      "Adding Nitro fallback to `_headers` to handle all unmatched routes."
    );
    contents = currentHeaders + "\n" + contents;
  }

  await fsp.writeFile(headersPath, contents);
}

// This is written to the functions directory. It just re-exports the compiled handler,
// along with its config. We do this instead of compiling the entrypoint directly because
// the Netlify platform actually statically analyzes the function file to read the config;
// if we compiled the entrypoint directly, it would be chunked and wouldn't be analyzable.
function generateNetlifyFunction(nitro: Nitro) {
  return /* js */ `
export { default } from "./main.mjs";
export const config = {
  name: "server handler",
  generator: ${getGeneratorString(nitro)},
  path: "/*",
  preferStatic: true,
};
    `.trim();
}

function getGeneratorString(nitro: Nitro) {
  return `${nitro.options.framework.name}@${nitro.options.framework.version} (nitro: v${version})`;
}
