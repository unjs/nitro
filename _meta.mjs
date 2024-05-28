import { fileURLToPath } from "node:url";

// export { version } from "./package.json";

export const pkgDir = fileURLToPath(new URL(".", import.meta.url));

export const runtimeDir = fileURLToPath(
  new URL("dist/runtime/", import.meta.url)
);

export const subpaths = [
  "cli",
  "core",
  "kit",
  "presets",
  "rollup",
  "schema",
  "config",
];

export const runtimeDependencies = [
  "h3",
  "cookie-es",
  "defu",
  "destr",
  "hookable",
  "iron-webcrypto",
  "klona",
  "node-fetch-native",
  "ofetch",
  "ohash",
  "pathe",
  "radix3",
  "scule",
  "ufo",
  "uncrypto",
  "unctx",
  "unenv",
  "unstorage",
  "crossws",
  "croner",
];
