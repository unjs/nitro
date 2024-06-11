import type { NitroPreset, NitroPresetMeta } from "nitropack/types";
import { kebabCase } from "scule";
import { provider, type ProviderName } from "std-env";
import allPresets from "./_all.gen";
import type { CompatibilityDates, DateString, PlatformName } from "compatx";

// std-env has more specific keys for providers
const _providerMap: Partial<Record<ProviderName, PlatformName>> = {
  aws_amplify: "aws",
  azure_static: "azure",
  cloudflare_pages: "cloudflare",
};

export async function resolvePreset(
  name: string,
  opts: { static?: boolean; compatibilityDates?: CompatibilityDates }
): Promise<(NitroPreset & { _meta?: NitroPresetMeta }) | undefined> {
  const _name = kebabCase(name) || provider;

  const _dates = (opts?.compatibilityDates || {}) as Record<string, DateString>;

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
        _dates[_providerMap[preset._meta.stdName!]!] ||
        _dates[preset._meta.stdName!] ||
        _dates[preset._meta.name!] ||
        _dates.default;

      if (
        _date &&
        preset._meta.compatibility?.date &&
        new Date(preset._meta.compatibility?.date) > new Date(_date)
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
