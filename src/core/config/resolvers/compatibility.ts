import { resolveCompatibilityDatesFromEnv } from "compatx";
import type { NitroOptions } from "nitropack/types";

export async function resolveCompatibilityOptions(options: NitroOptions) {
  options.compatibilityDates = {
    ...resolveCompatibilityDatesFromEnv(options.compatibilityDate),
    ...options.compatibilityDates,
  };
}
