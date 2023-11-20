import { defineCommand } from "citty";
import { resolve } from "pathe";
import destr from "destr";
import { runNitroTask } from "../../../task";

export default defineCommand({
  meta: {
    name: "run",
    description:
      "Run a runtime task in the currently running dev server (experimental)",
  },
  args: {
    name: {
      type: "positional",
      description: "task name",
      required: true,
    },
    dir: {
      type: "string",
      description: "project root directory",
    },
    payload: {
      type: "string",
      description: "payload json to pass to the task",
    },
  },
  async run({ args }) {
    const cwd = resolve((args.dir || args.cwd || ".") as string);
    const result = await runNitroTask(args.name, destr(args.payload || "{}"), {
      cwd,
      buildDir: ".nitro",
    });
    console.log(result);
  },
});
