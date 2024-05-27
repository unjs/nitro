import createJITI from "jiti";
import { consola } from "consola";
import { kebabCase, camelCase, pascalCase, snakeCase } from "scule";
import { readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NitroPreset, NitroPresetMeta } from "nitropack";
import { findTypeExports } from "mlly";

const autoGenHeader = /* ts */ `// Auto-generated using gen-presets script\n`;

// --- Scan presets/ directory ---
const presetsDir = fileURLToPath(new URL("../src/presets", import.meta.url));
const presetDirs: string[] = readdirSync(presetsDir, { withFileTypes: true })
  .filter(
    (dir) =>
      dir.isDirectory() &&
      existsSync(resolve(presetsDir, dir.name, "preset.ts"))
  )
  .map((dir) => dir.name);

// --- Load presets ---
const jitiRequire = createJITI(presetsDir, {
  esmResolve: true,
  interopDefault: true,
  alias: {
    "nitropack": fileURLToPath(new URL("../src/core/index.ts", import.meta.url)),
    ...Object.fromEntries(
      ["cli", "core", "kit", "presets", "rollup", "schema"].map(pkg => [
        `nitropack/${pkg}`, fileURLToPath(new URL(`../src/${pkg}/index.ts`, import.meta.url))
      ])
    )
  }
});
const allPresets: (NitroPreset & { _meta?: NitroPresetMeta })[] = [];
for (const preset of presetDirs) {
  const presetPath = resolve(presetsDir, preset, "preset.ts");
  const _presets = jitiRequire(presetPath);
  allPresets.push(..._presets);
}

// --- Validate names ---
const _names = new Set<string>();
for (const preset of allPresets) {
  if (!preset._meta?.name) {
    consola.warn(`Preset ${preset} does not have a name`);
    continue;
  }
  const names = [preset._meta.name, ...(preset._meta.aliases || [])];
  for (const name of names) {
    if (_names.has(name)) {
      if (!preset._meta.compatibility?.date) {
        consola.warn(`Preset ${name} is duplicated`);
      }
      continue;
    }
    if (kebabCase(name) !== name) {
      consola.warn(`Preset ${name} is not kebab-case`);
    }
    _names.add(name);
  }
}
const names = [..._names].sort();
consola.log(names.join(", "));

// --- Generate presets/_all.gen.ts ---
writeFileSync(
  resolve(presetsDir, "_all.gen.ts"),
  /* ts */ `${autoGenHeader}
${presetDirs
  .map((preset) => `import _${camelCase(preset)} from "./${preset}/preset";`)
  .join("\n")}

export default [
${presetDirs.map((preset) => `  ..._${camelCase(preset)},`).join("\n")}
] as const;
`
);
// --- Generate presets/_types.gen.ts ---
const presetsWithType = presetDirs.filter((presetDir) => {
  const presetPath = resolve(presetsDir, presetDir, "preset.ts");
  const content = readFileSync(presetPath, "utf8");
  const typeExports = findTypeExports(content);
  return typeExports.some(type => type.name === "PresetOptions")
});
writeFileSync(
  resolve(presetsDir, "_types.gen.ts"),
  /* ts */ `${autoGenHeader}
${presetsWithType.map((preset) => `import { PresetOptions as ${pascalCase(preset)}Options } from "./${preset}/preset";`).join("\n")}

export interface PresetOptions {
${presetsWithType.map((preset) => `  ${camelCase(preset)}: ${pascalCase(preset)}Options;`).join("\n")}
}

export type PresetName = ${names.map((name) => `"${name}"`).join(" | ")};

export type PresetNameInput = ${names.flatMap((name) => [...new Set([kebabCase(name), camelCase(name), snakeCase(name)])].map(n => `"${n}"`)).join(" | ")} | (string & {});
`
);
