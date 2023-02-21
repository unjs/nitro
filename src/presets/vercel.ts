import fsp from "node:fs/promises";
import { dirname, relative, resolve } from "pathe";
import { defu } from "defu";
import { withoutLeadingSlash } from "ufo";
import { writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";
import type { VercelBuildConfigV3 } from "../types/presets";

// https://vercel.com/docs/build-output-api/v3

export const vercel = defineNitroPreset({
  extends: "node",
  entry: "#internal/nitro/entries/vercel",
  output: {
    dir: "{{ rootDir }}/.vercel/output",
    serverDir: "{{ output.dir }}/functions/__nitro.func",
    publicDir: "{{ output.dir }}/static",
  },
  commands: {
    deploy: "",
    preview: "",
  },
  hooks: {
    async compiled(nitro: Nitro) {
      const buildConfigPath = resolve(nitro.options.output.dir, "config.json");
      const buildConfig = generateBuildConfig(nitro);
      await writeFile(buildConfigPath, JSON.stringify(buildConfig, null, 2));

      const systemNodeVersion = process.versions.node.split(".")[0];
      const runtimeVersion = `nodejs${systemNodeVersion}.x`;
      const functionConfigPath = resolve(
        nitro.options.output.serverDir,
        ".vc-config.json"
      );
      const functionConfig = {
        runtime: runtimeVersion,
        handler: "index.mjs",
        launcherType: "Nodejs",
        shouldAddHelpers: false,
      };
      await writeFile(
        functionConfigPath,
        JSON.stringify(functionConfig, null, 2)
      );

      // Write prerender functions
      const rules = Object.entries(nitro.options.routeRules).filter(
        ([_, value]) => value.cache && (value.cache.swr || value.cache.static)
      );

      for (const [key, value] of rules) {
        if (!value.cache) {
          continue;
        } // for type support
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

        let expiration: boolean | number = 60;
        if (value.cache.static) {
          expiration = false;
        } else if (typeof value.cache.swr === "number") {
          expiration = value.cache.swr;
        }

        await writeFile(
          funcPrefix + ".prerender-config.json",
          JSON.stringify({
            expiration,
            allowQuery: key.includes("/**") ? ["url"] : undefined,
          })
        );
      }
    },
  },
});

export const vercelEdge = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/vercel-edge",
  output: {
    dir: "{{ rootDir }}/.vercel/output",
    serverDir: "{{ output.dir }}/functions/__nitro.func",
    publicDir: "{{ output.dir }}/static",
  },
  commands: {
    deploy: "",
    preview: "",
  },
  rollupConfig: {
    output: {
      format: "module",
    },
  },
  hooks: {
    async compiled(nitro: Nitro) {
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
      };
      await writeFile(
        functionConfigPath,
        JSON.stringify(functionConfig, null, 2)
      );
    },
  },
});

function generateBuildConfig(nitro: Nitro) {
  const rules = Object.entries(nitro.options.routeRules).sort(
    (a, b) => b[0].split(/\/(?!\*)/).length - a[0].split(/\/(?!\*)/).length
  );

  return defu(nitro.options.vercel?.config, <VercelBuildConfigV3>{
    version: 3,
    overrides: Object.fromEntries(
      (
        nitro._prerenderedRoutes?.filter((r) => r.fileName !== r.route) || []
      ).map(({ route, fileName }) => [
        withoutLeadingSlash(fileName),
        { path: route.replace(/^\//, "") },
      ])
    ),
    routes: [
      ...rules
        .filter(([_, routeRules]) => routeRules.redirect || routeRules.headers)
        .map(([path, routeRules]) => {
          let route = {
            src: path.replace("/**", "/.*"),
          };
          if (routeRules.redirect) {
            route = defu(route, {
              status: routeRules.redirect.statusCode,
              headers: { Location: routeRules.redirect.to },
            });
          }
          if (routeRules.headers) {
            route = defu(route, { headers: routeRules.headers });
          }
          return route;
        }),
      ...nitro.options.publicAssets
        .filter((asset) => !asset.fallthrough)
        .map((asset) => asset.baseURL)
        .map((baseURL) => ({
          src: baseURL + "(.*)",
          headers: {
            "cache-control": "public,max-age=31536000,immutable",
          },
          continue: true,
        })),
      { handle: "filesystem" },
      ...rules
        .filter(
          ([key, value]) =>
            value.cache === false ||
            (value.cache && value.cache.swr === false) ||
            (value.cache &&
              (value.cache.swr || value.cache.static) &&
              key.includes("/**"))
        )
        .map(([key, value]) => {
          const src = key.replace(/^(.*)\/\*\*/, "(?<url>$1/.*)");
          if (
            value.cache === false ||
            (value.cache && value.cache.swr === false)
          ) {
            // we need to write a rule to avoid route being shadowed by another cache rule elsewhere
            return {
              src,
              dest: "/__nitro",
            };
          }
          return {
            src,
            dest: generateEndpoint(key) + "?url=$url",
          };
        }),
      // If we are using a prerender function for /, then we need to write this explicitly
      ...(nitro.options.routeRules["/"]?.cache
        ? [
            {
              src: "(?<url>/)",
              dest: "/__nitro-index",
            },
          ]
        : []),
      // If we are using a prerender function as a fallback, then we do not need to output
      // the below fallback route as well
      ...(!nitro.options.routeRules["/**"]?.cache ||
      !(
        nitro.options.routeRules["/**"].cache.swr ||
        nitro.options.routeRules["/**"]?.cache.static
      )
        ? [
            {
              src: "/(.*)",
              dest: "/__nitro",
            },
          ]
        : []),
    ],
  });
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
