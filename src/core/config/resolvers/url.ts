import type { NitroOptions } from "nitropack/types";
import { withLeadingSlash, withTrailingSlash } from "ufo";

export async function resolveURLOptions(options: NitroOptions) {
  options.baseURL = withLeadingSlash(withTrailingSlash(options.baseURL));
}
