import { fileURLToPath } from "mlly";
import { resolve } from "pathe";
import {
  createNitro,
  generateTemplates,
  scanHandlers,
  writeTypes,
} from "nitropack/core";

const prepare = async () => {
  const fixtureDir = fileURLToPath(new URL("../fixture", import.meta.url).href);

  const nitro = await createNitro({
    rootDir: fixtureDir,
    serveStatic: true,
    output: { dir: resolve(fixtureDir, ".output", "types") },
  });

  await scanHandlers(nitro);
  await writeTypes(nitro);
  await generateTemplates(nitro);
};

prepare();
