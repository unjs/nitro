import { defineCommand } from "citty";
import { resolve } from "pathe";
import { createNitro } from "../../nitro";
import { writeTypes } from "../../build";
import { commonArgs } from "../common";

export default defineCommand({
  meta: {
    name: "prepare",
    description: "Generate types for the project",
  },
  args: {
    ...commonArgs,
  },
  async run({ args }) {
    const rootDir = resolve((args.dir || args._dir || ".") as string);
    const nitro = await createNitro({ rootDir });
    await writeTypes(nitro);
  },
});
