import { defineCommand } from "citty";
import { resolve } from "pathe";
import { listNitroTasks } from "../../../task";

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
    const tasks = await listNitroTasks({ cwd, buildDir: ".nitro" });
    console.log(tasks);
  },
});
