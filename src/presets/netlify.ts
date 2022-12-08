import { existsSync, promises as fsp } from "node:fs";
import { join, dirname } from "pathe";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

// Netlify functions
export const netlify = defineNitroPreset({
  extends: "aws-lambda",
  entry: "#internal/nitro/entries/netlify",
  output: {
    dir: "{{ rootDir }}/.netlify/functions-internal",
    publicDir: "{{ rootDir }}/dist"
  },
  rollupConfig: {
    output: {
      entryFileNames: "server.mjs"
    }
  },
  hooks: {
    async "compiled" (nitro: Nitro) {
      await writeHeaders(nitro);
      await writeRedirects(nitro);

      const serverCJSPath = join(nitro.options.output.serverDir, "server.js");
      const serverJSCode = `
let _handler
exports.handler = function handler (event, context) {
  if (_handler) {
    return _handler(event, context)
  }
  return import('./server.mjs').then(m => {
    _handler = m.handler
    return _handler(event, context)
  })
}
`.trim();
      await fsp.writeFile(serverCJSPath, serverJSCode);
    }
  }
});

// Netlify builder
export const netlifyBuilder = defineNitroPreset({
  extends: "netlify",
  entry: "#internal/nitro/entries/netlify-builder"
});

// Netlify edge
export const netlifyEdge = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/netlify-edge",
  output: {
    serverDir: "{{ rootDir }}/.netlify/edge-functions",
    publicDir: "{{ rootDir }}/dist"
  },
  rollupConfig: {
    output: {
      entryFileNames: "server.js",
      format: "esm"
    }
  },
  hooks: {
    async "compiled" (nitro: Nitro) {
      const manifest = {
        version: 1,
        functions: [
          {
            function: "server",
            pattern: "^.*$"
          }
        ]
      };
      const manifestPath = join(nitro.options.rootDir, ".netlify/edge-functions/manifest.json");
      await fsp.mkdir(dirname(manifestPath), { recursive: true });
      await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    }
  }
});

async function writeRedirects (nitro: Nitro) {
  const redirectsPath = join(nitro.options.output.publicDir, "_redirects");
  let contents = "/* /.netlify/functions/server 200";

  // Rewrite static cached paths to builder functions
  for (const [key] of Object.entries(nitro.options.routeRules)
    .filter(([_, routeRules]) => routeRules.cache && (routeRules.cache?.static || routeRules.cache?.swr))
  ) {
    contents = `${key.replace("/**", "/*")}\t/.netlify/builders/server 200\n` + contents;
  }

  for (const [key, routeRules] of Object.entries(nitro.options.routeRules).filter(([_, routeRules]) => routeRules.redirect)) {
    // TODO: Remove map when netlify support 307/308
    let code = routeRules.redirect.statusCode;
    code = ({ 307: 302, 308: 301 })[code] || code;
    contents = `${key.replace("/**", "/*")}\t${routeRules.redirect.to}\t${code}\n` + contents;
  }

  if (existsSync(redirectsPath)) {
    const currentRedirects = await fsp.readFile(redirectsPath, "utf8");
    if (/^\/\* /m.test(currentRedirects)) {
      nitro.logger.info("Not adding Nitro fallback to `_redirects` (as an existing fallback was found).");
      return;
    }
    nitro.logger.info("Adding Nitro fallback to `_redirects` to handle all unmatched routes.");
    contents = currentRedirects + "\n" + contents;
  }

  await fsp.writeFile(redirectsPath, contents);
}

async function writeHeaders (nitro: Nitro) {
  const headersPath = join(nitro.options.output.publicDir, "_headers");
  let contents = "";

  for (const [path, routeRules] of Object.entries(nitro.options.routeRules)
    .filter(([_, routeRules]) => routeRules.headers)) {
    const headers = [
      path.replace("/**", "/*"),
      ...Object.entries({ ...routeRules.headers }).map(([header, value]) => `  ${header}: ${value}`)
    ].join("\n");

    contents += headers + "\n";
  }

  if (existsSync(headersPath)) {
    const currentHeaders = await fsp.readFile(headersPath, "utf8");
    if (/^\/\* /m.test(currentHeaders)) {
      nitro.logger.info("Not adding Nitro fallback to `_headers` (as an existing fallback was found).");
      return;
    }
    nitro.logger.info("Adding Nitro fallback to `_headers` to handle all unmatched routes.");
    contents = currentHeaders + "\n" + contents;
  }

  await fsp.writeFile(headersPath, contents);
}
