import { fileURLToPath } from "mlly";
import { resolve } from "pathe";
import * as _nitro from "../../src";

const { createNitro, scanHandlers, writeTypes } = (_nitro as any as { default: typeof _nitro }).default || _nitro;

const prepare = async () => {
  const fixtureDir = fileURLToPath(new URL("../fixture", import.meta.url).href);

  const nitro = await createNitro({
    rootDir: fixtureDir,
    serveStatic: true,
    output: { dir: resolve(fixtureDir, ".output", "types") }
  });

  await scanHandlers(nitro);
  await writeTypes(nitro);
};

prepare();
