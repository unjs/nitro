import { existsSync } from "node:fs";
import { join, relative, basename } from "pathe";
import { readPackageJSON, writePackageJSON } from "pkg-types";
import type { Plugin } from "rollup";
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
    gen: (Number.parseInt(process.env.NITRO_FIREBASE_GEN) || "default") as any,
  },
  hooks: {
    async compiled(nitro) {
      await writeFirebaseConfig(nitro);
      await updatePackageJSON(nitro);
    },
    "rollup:before": (nitro, rollupConfig) => {
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

      // Replace __firebaseServerFunctionName__ to actual name in entries
      (rollupConfig.plugins as Plugin[]).unshift({
        name: "nitro:firebase",
        transform: (code, id) => {
          if (basename(id).startsWith("firebase-gen-")) {
            return {
              code: code.replace(
                /__firebaseServerFunctionName__/g,
                nitro.options.firebase?.serverFunctionName || "server"
              ),
              map: null,
            };
          }
        },
      } satisfies Plugin);
    },
  },
});

async function writeFirebaseConfig(nitro: Nitro) {
  const firebaseConfigPath = join(nitro.options.rootDir, "firebase.json");
  if (existsSync(firebaseConfigPath)) {
    return;
  }
  const firebaseConfig = {
    functions: {
      source: relative(nitro.options.rootDir, nitro.options.output.serverDir),
    },
    hosting: [
      {
        site: "<your_project_id>",
        public: relative(nitro.options.rootDir, nitro.options.output.publicDir),
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
  await writeFile(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
}

async function updatePackageJSON(nitro: Nitro) {
  const packageJSONPath = join(nitro.options.output.serverDir, "package.json");
  const packageJSON = await readPackageJSON(packageJSONPath);
  await writePackageJSON(packageJSONPath, {
    ...packageJSON,
    main: "index.mjs",
    dependencies: Object.fromEntries(
      Object.entries({
        // Default to "latest" normally they should be overriden with user versions
        "firebase-admin": "latest",
        "firebase-functions": "latest",
        ...packageJSON.dependencies,
      })
        .filter((e) => e[0] !== "fsevents")
        .sort(([a], [b]) => a.localeCompare(b))
    ),
    engines: {
      // https://cloud.google.com/functions/docs/concepts/nodejs-runtime
      // const supportedNodeVersions = new Set(["20", "18", "16"]);
      node: nitro.options.firebase?.nodeVersion || "18",
    },
  });
}
