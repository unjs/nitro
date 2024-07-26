import { defineCommand } from "citty";
import { consola } from "consola";
import { createNitro, listTasks } from "nitropack/core";
import { resolve } from "pathe";

export default defineCommand({
  meta: {
    name: "run",
    description: "List available tasks (experimental)",
  },
  args: {
    dir: {
      type: "string",
      description: "project root directory",
    },
  },
  async run({ args }) {
    const cwd = resolve((args.dir || args.cwd || ".") as string);
    const nitro = await createNitro({ rootDir: cwd });

    const tasks = await listTasks({ cwd, buildDir: nitro.options.buildDir });
    for (const [name, task] of Object.entries(tasks)) {
      consola.log(
        ` - \`${name}\`${
          task.meta?.description ? ` - ${task.meta.description}` : ""
        }`
      );
    }

    await nitro.close();
  },
});
