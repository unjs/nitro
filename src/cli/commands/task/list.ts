import { defineCommand } from "citty";
import { resolve } from "pathe";
import { consola } from "consola";
import { listTasks } from "../../../task";

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
    buildDir: {
      type: "string",
      description: "Build directory",
    },
  },
  async run({ args }) {
    const cwd = resolve((args.dir || args.cwd || ".") as string);
    const tasks = await listTasks({ cwd, buildDir: args.buildDir || ".nitro" });
    for (const [name, task] of Object.entries(tasks)) {
      consola.log(
        ` - \`${name}\`${task.meta?.description ? ` - ${task.meta.description}` : ""}`
      );
    }
  },
});
