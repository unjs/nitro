import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "pathe";
import { globby } from "globby";
import { readPackageJSON } from "pkg-types";
import { writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

export const firebase = defineNitroPreset({
  entry: `#internal/nitro/entries/firebase-gen-{{ firebase.gen }}`,
  commands: {
    deploy: "npx firebase-tools deploy",
  },
  firebase: {
    // we need this defined here so it's picked up by the template in firebase's entry
    gen: (process.env.NITRO_FIREBASE_GEN || "default") as any,
  },
  hooks: {
    async compiled(ctx) {
      await writeRoutes(ctx);
    },

    "rollup:before": (nitro) => {
      const _gen = nitro.options.firebase?.gen as unknown;
      if (!_gen || _gen === "default") {
        nitro.logger.warn(
          "Neither `firebase.gen` or `NITRO_FIREBASE_GEN` is set. Nitro will default to Cloud Functions 1st generation. It is recommended to set this to the latest generation (currently `2`). Set the version to remove this warning. See https://nitro.unjs.io/deploy/providers/firebase for more information."
        );
        // Using the gen 1 makes this preset backwards compatible for people already using it
        nitro.options.firebase = { gen: 1 };
      }
      nitro.options.appConfig.nitro = nitro.options.appConfig.nitro || {};
      nitro.options.appConfig.nitro.firebase = nitro.options.firebase;
    },
  },
});

async function writeRoutes(nitro: Nitro) {
  if (!existsSync(join(nitro.options.rootDir, "firebase.json"))) {
    const firebase = {
      functions: {
        source: relative(nitro.options.rootDir, nitro.options.output.serverDir),
      },
      hosting: [
        {
          site: "<your_project_id>",
          public: relative(
            nitro.options.rootDir,
            nitro.options.output.publicDir
          ),
          cleanUrls: true,
          rewrites: [
            {
              source: "**",
              function: "server",
            },
          ],
        },
      ],
    };
    await writeFile(
      resolve(nitro.options.rootDir, "firebase.json"),
      JSON.stringify(firebase)
    );
  }

  const _require = createRequire(import.meta.url);

  const jsons = await globby(
    join(nitro.options.output.serverDir, "node_modules/**[!fsevents]/package.json"),
  );
  const prefixLength = `${nitro.options.output.serverDir}/node_modules/`.length;
  const suffixLength = "/package.json".length;
  // eslint-disable-next-line unicorn/no-array-reduce
  const dependencies = jsons.reduce(
    (obj, packageJson) => {
      const dirname = packageJson.slice(prefixLength, -suffixLength);
      if (!dirname.includes("node_modules")) {
        obj[dirname] = _require(packageJson).version;
      }
      return obj;
    },
    {} as Record<string, string>
  );

  // https://cloud.google.com/functions/docs/concepts/nodejs-runtime
  // const supportedNodeVersions = new Set(["20", "18", "16"]);
  const nodeVersion: string = nitro.options.firebase?.nodeVersion || "18";

  const getPackageVersion = async (id) => {
    const pkg = await readPackageJSON(id, {
      url: nitro.options.nodeModulesDirs,
    });
    return pkg.version;
  };

  await writeFile(
    resolve(nitro.options.output.serverDir, "package.json"),
    JSON.stringify(
      {
        private: true,
        type: "module",
        main: "./index.mjs",
        dependencies: {
          "firebase-functions-test": "latest",
          "firebase-admin": await getPackageVersion("firebase-admin"),
          "firebase-functions": await getPackageVersion("firebase-functions"),
          ...dependencies,
        },
        engines: { node: nodeVersion },
      },
      null,
      2
    )
  );
}
