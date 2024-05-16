import type { NitroPreset, NitroPresetMeta } from "./types";
import { fileURLToPath } from "node:url";
import { kebabCase } from "scule";
import { provider } from 'std-env'

export function defineNitroPreset<
  P extends NitroPreset,
  M extends NitroPresetMeta,
>(preset: P, meta?: M): P & { _meta: NitroPresetMeta } {
  if (
    meta?.url &&
    typeof preset !== "function" &&
    preset.entry &&
    preset.entry.startsWith(".")
  ) {
    preset.entry = fileURLToPath(new URL(preset.entry, meta.url));
  }
  return { ...preset, _meta: meta } as P & { _meta: M };
}

let _presets: typeof import("./presets")["presets"]

export async function resolvePreset(name: string, opts: { static?: boolean, compatibilityDate?: string }): Promise<(NitroPreset & { _meta?: NitroPresetMeta }) | undefined> {
  if (!_presets) {
    _presets = (await import("./presets") as typeof import("./presets")).presets;
  }

  const _name = kebabCase(name) || provider;
  const _date = new Date(opts.compatibilityDate || 0);

  const matches = _presets.filter((preset) => {
    const names = [preset._meta.name, preset._meta.stdName, ...(preset._meta.aliases || [])].filter(Boolean);
    if (!names.includes(_name)) {
      return false;
    }
    if ((opts?.static || false) !== (preset._meta.static || false)) {
      return false
    }
    if (preset._meta.compatibility?.date && new Date(preset._meta.compatibility?.date || 0) > _date) {
      return false
    }
    return true
  }).sort((a, b) => {
    const aDate = new Date(a._meta.compatibility?.date || 0);
    const bDate = new Date(b._meta.compatibility?.date || 0);
    return bDate > aDate ? 1 : -1
  });

  const preset = matches[0];
  if (typeof preset === 'function') {
    return preset();
  }

  if (!name && !preset) {
    return opts?.static ? resolvePreset('static', opts) : resolvePreset('node-server', opts)
  }

  return preset;
}

