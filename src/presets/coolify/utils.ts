import type { Nitro } from "nitropack/types";
import { join } from "pathe";
import { readPackageJSON, writePackageJSON } from "pkg-types";
  
export async function updatePackageJSON(nitro: Nitro) {
    const packageJSONPath = join(nitro.options.output.serverDir, "package.json");
    const packageJSON = await readPackageJSON(packageJSONPath);
    await writePackageJSON(packageJSONPath, {
      ...packageJSON,
      scripts: {
        ...packageJSON.scripts,
        start: "node ./server/index.mjs"
      },
    });
  }