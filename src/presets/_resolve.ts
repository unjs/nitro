import {
  type CompatibilityDateSpec,
  type PlatformName,
  resolveCompatibilityDatesFromEnv,
} from "compatx";
import type { NitroPreset, NitroPresetMeta } from "nitropack/types";
import { kebabCase } from "scule";
import { type ProviderName, provider } from "std-env";
import allPresets from "./_all.gen";

// std-env has more specific keys for providers than compatx
const _stdProviderMap: Partial<Record<ProviderName, PlatformName>> = {
  aws_amplify: "aws",
  azure_static: "azure",
  cloudflare_pages: "cloudflare",
};

export async function resolvePreset(
  name: string,
  opts: { static?: boolean; compatibilityDate?: CompatibilityDateSpec }
): Promise<(NitroPreset & { _meta?: NitroPresetMeta }) | undefined> {
  const _name = kebabCase(name) || provider;

  const _compatDates = resolveCompatibilityDatesFromEnv(opts.compatibilityDate);

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

      const _date =
        _compatDates[_stdProviderMap[preset._meta.stdName!] as PlatformName] ||
        _compatDates[preset._meta.stdName as PlatformName] ||
        _compatDates[preset._meta.name as PlatformName] ||
        _compatDates.default;

      if (
        _date &&
        preset._meta.compatibilityDate &&
        new Date(preset._meta.compatibilityDate) > new Date(_date)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aDate = new Date(a._meta.compatibilityDate || 0);
      const bDate = new Date(b._meta.compatibilityDate || 0);
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
