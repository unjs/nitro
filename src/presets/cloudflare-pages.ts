import { existsSync, promises as fsp } from "node:fs";
import { resolve, join } from "pathe";
import { joinURL, withLeadingSlash, withoutLeadingSlash } from "ufo";
import { globby } from "globby";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

export const cloudflarePages = defineNitroPreset({
  extends: "cloudflare",
  entry: "#internal/nitro/entries/cloudflare-pages",
  exportConditions: ["workerd"],
  commands: {
    preview: "npx wrangler pages dev ./",
    deploy: "npx wrangler pages deploy ./",
  },
  output: {
    dir: "{{ rootDir }}/dist",
    publicDir: "{{ output.dir }}",
    serverDir: "{{ output.dir }}",
  },
  alias: {
    // Hotfix: Cloudflare appends /index.html if mime is not found and things like ico are not in standard lite.js!
    // https://github.com/unjs/nitro/pull/933
    _mime: "mime/index.js",
  },
  rollupConfig: {
    output: {
      entryFileNames: "_worker.js",
      format: "esm",
    },
  },
  hooks: {
    "rollup:before"(nitro, rollupConfig) {
      if (process.env.NITRO_EXP_CLOUDFLARE_DYNAMIC_IMPORTS) {
        rollupConfig.output = {
          ...rollupConfig.output,
          entryFileNames: "index.js",
          dir: resolve(nitro.options.output.serverDir, "_worker.js"),
          inlineDynamicImports: false,
        };
      }
    },
    async compiled(nitro: Nitro) {
      await writeCFRoutes(nitro);
    },
  },
});

export const cloudflarePagesStatic = defineNitroPreset({
  extends: "static",
  output: {
    publicDir: "{{ rootDir }}/dist",
  },
  commands: {
    preview: "npx wrangler pages dev dist",
    deploy: "npx wrangler pages deploy dist",
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await writeCFPagesHeaders(nitro);
      await writeCFPagesRedirects(nitro);
    },
  },
});

/**
 * https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
 */
export interface CloudflarePagesRoutes {
  /** Defines the version of the schema. Currently there is only one version of the schema (version 1), however, we may add more in the future and aim to be backwards compatible. */
  version?: 1;

  /** Defines routes that will be invoked by Functions. Accepts wildcard behavior. */
  include?: string[];

  /** Defines routes that will not be invoked by Functions. Accepts wildcard behavior. `exclude` always take priority over `include`. */
  exclude?: string[];
}

async function writeCFRoutes(nitro: Nitro) {
  const _cfPagesConfig = nitro.options.cloudflare?.pages || {};
  const routes: CloudflarePagesRoutes = {
    version: _cfPagesConfig.routes?.version || 1,
    include: _cfPagesConfig.routes?.include || ["/*"],
    exclude: _cfPagesConfig.routes?.exclude || [],
  };

  const writeRoutes = () =>
    fsp.writeFile(
      resolve(nitro.options.output.publicDir, "_routes.json"),
      JSON.stringify(routes, undefined, 2)
    );

  if (_cfPagesConfig.defaultRoutes === false) {
    await writeRoutes();
    return;
  }

  // Exclude public assets from hitting the worker
  const explicitPublicAssets = nitro.options.publicAssets.filter(
    (i) => !i.fallthrough
  );

  // Explicit prefixes
  routes.exclude.push(
    ...explicitPublicAssets
      .map((dir) => joinURL(dir.baseURL, "*"))
      .sort(comparePaths)
  );

  // Unprefixed assets
  const publicAssetFiles = await globby("**", {
    cwd: nitro.options.output.publicDir,
    absolute: false,
    dot: true,
    ignore: [
      "_worker.js",
      "_worker.js.map",
      "nitro.json",
      ...explicitPublicAssets.map((dir) =>
        withoutLeadingSlash(joinURL(dir.baseURL, "**"))
      ),
    ],
  });
  routes.exclude.push(
    ...publicAssetFiles.map((i) => withLeadingSlash(i)).sort(comparePaths)
  );

  // Only allow 100 rules in total (include + exclude)
  routes.exclude.splice(100 - routes.include.length);

  await writeRoutes();
}

function comparePaths(a: string, b: string) {
  return a.split("/").length - b.split("/").length || a.localeCompare(b);
}

async function writeCFPagesHeaders(nitro: Nitro) {
  const headersPath = join(nitro.options.output.publicDir, "_headers");
  const contents = [];

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

    contents.push(headers);
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
    contents.unshift(currentHeaders);
  }

  await fsp.writeFile(headersPath, contents.join("\n"));
}

async function writeCFPagesRedirects(nitro: Nitro) {
  const redirectsPath = join(nitro.options.output.publicDir, "_redirects");
  const staticFallback = existsSync(
    join(nitro.options.output.publicDir, "404.html")
  )
    ? "/* /404.html 404"
    : "";
  const contents = [staticFallback];
  const rules = Object.entries(nitro.options.routeRules).sort(
    (a, b) => a[0].split(/\/(?!\*)/).length - b[0].split(/\/(?!\*)/).length
  );

  for (const [key, routeRules] of rules.filter(
    ([_, routeRules]) => routeRules.redirect
  )) {
    const code = routeRules.redirect.statusCode;
    contents.unshift(
      `${key.replace("/**", "/*")}\t${routeRules.redirect.to}\t${code}`
    );
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
    contents.unshift(currentRedirects);
  }

  await fsp.writeFile(redirectsPath, contents.join("\n"));
}
