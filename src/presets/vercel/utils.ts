import fsp from "node:fs/promises";
import { defu } from "defu";
import { writeFile } from "nitro/kit";
import type { Nitro } from "nitro/types";
import { dirname, relative, resolve } from "pathe";
import { joinURL, withoutLeadingSlash } from "ufo";
import type {
  VercelBuildConfigV3,
  VercelServerlessFunctionConfig,
} from "./types";

export async function generateFunctionFiles(nitro: Nitro) {
  const buildConfigPath = resolve(nitro.options.output.dir, "config.json");
  const buildConfig = generateBuildConfig(nitro);
  await writeFile(buildConfigPath, JSON.stringify(buildConfig, null, 2));

  const systemNodeVersion = process.versions.node.split(".")[0];
  const runtimeVersion = `nodejs${systemNodeVersion}.x`;
  const functionConfigPath = resolve(
    nitro.options.output.serverDir,
    ".vc-config.json"
  );
  const functionConfig: VercelServerlessFunctionConfig = {
    runtime: runtimeVersion,
    handler: "index.mjs",
    launcherType: "Nodejs",
    shouldAddHelpers: false,
    supportsResponseStreaming: true,
    ...nitro.options.vercel?.functions,
  };
  await writeFile(functionConfigPath, JSON.stringify(functionConfig, null, 2));

  // Write ISR functions
  for (const [key, value] of Object.entries(nitro.options.routeRules)) {
    if (!value.isr) {
      continue;
    }
    const funcPrefix = resolve(
      nitro.options.output.serverDir,
      ".." + generateEndpoint(key)
    );
    await fsp.mkdir(dirname(funcPrefix), { recursive: true });
    await fsp.symlink(
      "./" + relative(dirname(funcPrefix), nitro.options.output.serverDir),
      funcPrefix + ".func",
      "junction"
    );
    await writeFile(
      funcPrefix + ".prerender-config.json",
      JSON.stringify({
        expiration: value.isr === true ? false : value.isr,
        allowQuery: key.includes("/**") ? ["url"] : undefined,
        bypassToken: nitro.options.vercel?.config?.bypassToken,
      })
    );
  }
}

export async function generateEdgeFunctionFiles(nitro: Nitro) {
  const buildConfigPath = resolve(nitro.options.output.dir, "config.json");
  const buildConfig = generateBuildConfig(nitro);
  await writeFile(buildConfigPath, JSON.stringify(buildConfig, null, 2));

  const functionConfigPath = resolve(
    nitro.options.output.serverDir,
    ".vc-config.json"
  );
  const functionConfig = {
    runtime: "edge",
    entrypoint: "index.mjs",
    regions: nitro.options.vercel?.regions,
  };
  await writeFile(functionConfigPath, JSON.stringify(functionConfig, null, 2));
}

export async function generateStaticFiles(nitro: Nitro) {
  const buildConfigPath = resolve(nitro.options.output.dir, "config.json");
  const buildConfig = generateBuildConfig(nitro);
  await writeFile(buildConfigPath, JSON.stringify(buildConfig, null, 2));
}

function generateBuildConfig(nitro: Nitro) {
  const rules = Object.entries(nitro.options.routeRules).sort(
    (a, b) => b[0].split(/\/(?!\*)/).length - a[0].split(/\/(?!\*)/).length
  );

  const config = defu(nitro.options.vercel?.config, <VercelBuildConfigV3>{
    version: 3,
    overrides: {
      // Nitro static prerendered route overrides
      ...Object.fromEntries(
        (
          nitro._prerenderedRoutes?.filter((r) => r.fileName !== r.route) || []
        ).map(({ route, fileName }) => [
          withoutLeadingSlash(fileName),
          { path: route.replace(/^\//, "") },
        ])
      ),
    },
    routes: [
      // Redirect and header rules
      ...rules
        .filter(([_, routeRules]) => routeRules.redirect || routeRules.headers)
        .map(([path, routeRules]) => {
          let route = {
            src: path.replace("/**", "/(.*)"),
          };
          if (routeRules.redirect) {
            route = defu(route, {
              status: routeRules.redirect.statusCode,
              headers: {
                Location: routeRules.redirect.to.replace("/**", "/$1"),
              },
            });
          }
          if (routeRules.headers) {
            route = defu(route, { headers: routeRules.headers });
          }
          return route;
        }),
      // Public asset rules
      ...nitro.options.publicAssets
        .filter((asset) => !asset.fallthrough)
        .map((asset) => joinURL(nitro.options.baseURL, asset.baseURL || "/"))
        .map((baseURL) => ({
          src: baseURL + "(.*)",
          headers: {
            "cache-control": "public,max-age=31536000,immutable",
          },
          continue: true,
        })),
      { handle: "filesystem" },
    ],
  });

  // Early return if we are building a static site
  if (nitro.options.static) {
    return config;
  }

  config.routes!.push(
    // ISR rules
    ...rules
      .filter(
        ([key, value]) =>
          // value.isr === false || (value.isr && key.includes("/**"))
          value.isr !== undefined && key !== "/"
      )
      .map(([key, value]) => {
        const src = key.replace(/^(.*)\/\*\*/, "(?<url>$1/.*)");
        if (value.isr === false) {
          // we need to write a rule to avoid route being shadowed by another cache rule elsewhere
          return {
            src,
            dest: "/__nitro",
          };
        }
        return {
          src,
          dest:
            nitro.options.preset === "vercel-edge"
              ? "/__nitro?url=$url"
              : generateEndpoint(key) + "?url=$url",
        };
      }),
    // If we are using an ISR function for /, then we need to write this explicitly
    ...(nitro.options.routeRules["/"]?.isr
      ? [
          {
            src: "(?<url>/)",
            dest: "/__nitro-index?url=$url",
          },
        ]
      : []),
    // If we are using an ISR function as a fallback, then we do not need to output the below fallback route as well
    ...(nitro.options.routeRules["/**"]?.isr
      ? []
      : [
          {
            src: "/(.*)",
            dest: "/__nitro",
          },
        ])
  );

  return config;
}

function generateEndpoint(url: string) {
  if (url === "/") {
    return "/__nitro-index";
  }
  return url.includes("/**")
    ? "/__nitro-" +
        withoutLeadingSlash(url.replace(/\/\*\*.*/, "").replace(/[^a-z]/g, "-"))
    : url;
}

export function deprecateSWR(nitro: Nitro) {
  if (nitro.options.future.nativeSWR) {
    return;
  }
  let hasLegacyOptions = false;
  for (const [key, value] of Object.entries(nitro.options.routeRules)) {
    if (_hasProp(value, "isr")) {
      continue;
    }
    if (value.cache === false) {
      value.isr = false;
    }
    if (_hasProp(value, "static")) {
      value.isr = !(value as { static: boolean }).static;
      hasLegacyOptions = true;
    }
    if (value.cache && _hasProp(value.cache, "swr")) {
      value.isr = value.cache.swr;
      hasLegacyOptions = true;
    }
  }
  if (hasLegacyOptions) {
    console.warn(
      "[nitro] Nitro now uses `isr` option to configure ISR behavior on Vercel. Backwards-compatible support for `static` and `swr` options within the Vercel Build Options API will be removed in the future versions. Set `future.nativeSWR: true` nitro config disable this warning."
    );
  }
}

function _hasProp(obj: any, prop: string) {
  return obj && typeof obj === "object" && prop in obj;
}
