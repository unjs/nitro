import { defineCommand } from "citty";
import { resolve } from "pathe";
import destr from "destr";
import { consola } from "consola";
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
    consola.info(`Running task \`${args.name}\`...`);
    try {
      const { result } = await runNitroTask(
        args.name,
        destr(args.payload || "{}"),
        {
          cwd,
          buildDir: ".nitro",
        }
      );
      consola.success("Result:", result);
    } catch (err) {
      consola.error(`Failed to run task \`${args.name}\`: ${err.message}`);
      process.exit(1); // eslint-disable-line unicorn/no-process-exit
    }
  },
});
