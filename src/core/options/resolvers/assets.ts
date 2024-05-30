import { resolve } from "pathe";
import { withLeadingSlash, withoutTrailingSlash } from "ufo";
import type { NitroOptions } from "nitropack/types";

export async function resolveAssetsOptions(options: NitroOptions) {
  for (const publicAsset of options.publicAssets) {
    publicAsset.dir = resolve(options.srcDir, publicAsset.dir);
    publicAsset.baseURL = withLeadingSlash(
      withoutTrailingSlash(publicAsset.baseURL || "/")
    );
  }

  for (const serverAsset of options.serverAssets) {
    serverAsset.dir = resolve(options.srcDir, serverAsset.dir);
  }
}
