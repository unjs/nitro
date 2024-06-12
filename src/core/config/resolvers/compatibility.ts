import { resolveCompatibilityDatesFromEnv, formatDate } from "compatx";
import consola from "consola";
import type { NitroOptions } from "nitropack/types";

// Nitro v2.9.6 release
export const fallbackCompatibilityDate = "2024-04-03";

export async function resolveCompatibilityOptions(options: NitroOptions) {
  options.compatibilityDate = resolveCompatibilityDatesFromEnv(
    options.compatibilityDate
  );
  if (
    !options.compatibilityDate.default &&
    options.preset !== "nitro-prerender"
  ) {
    const _todayDate = formatDate(new Date());
    consola
      .withTag("nitro")
      .warn(
        `No valid compatibility date is specified. Using \`${fallbackCompatibilityDate}\` as fallback.`,
        `\n\n💡 You can use current compatibility using \`COMPATIBILITY_DATE=${_todayDate}\` environment variable or \`compatibilityDate: '${_todayDate}'\` config.`
      );
    options.compatibilityDate.default = fallbackCompatibilityDate;
  }
}
