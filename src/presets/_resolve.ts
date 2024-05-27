import type { NitroPreset, NitroPresetMeta } from "nitropack";
import { kebabCase } from "scule";
import { provider } from "std-env";
import allPresets from "./_all.gen";

export async function resolvePreset(
  name: string,
  opts: { static?: boolean; compatibilityDate?: string }
): Promise<(NitroPreset & { _meta?: NitroPresetMeta }) | undefined> {
  const _name = kebabCase(name) || provider;
  const _date = new Date(opts.compatibilityDate || 0);

  const matches = allPresets
    .filter((preset) => {
      const names = [
        preset._meta.name,
        preset._meta.stdName,
        ...(preset._meta.aliases || []),
      ].filter(Boolean);
      if (!names.includes(_name)) {
        return false;
      }
      if (
        preset._meta.compatibility?.date &&
        new Date(preset._meta.compatibility?.date || 0) > _date
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aDate = new Date(a._meta.compatibility?.date || 0);
      const bDate = new Date(b._meta.compatibility?.date || 0);
      return bDate > aDate ? 1 : -1;
    });

  const preset =
    matches.find(
      (p) => (p._meta.static || false) === (opts?.static || false)
    ) || matches[0];

  if (typeof preset === "function") {
    return preset();
  }

  if (!name && !preset) {
    return opts?.static
      ? resolvePreset("static", opts)
      : resolvePreset("node-server", opts);
  }

  return preset;
}
