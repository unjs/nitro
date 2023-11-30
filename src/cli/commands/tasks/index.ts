import { defineCommand } from "citty";

export default defineCommand({
  meta: {
    name: "tasks",
    description: "Operate in nitro tasks (experimental)",
  },
  subCommands: {
    list: () => import("./list").then((r) => r.default),
    run: () => import("./run").then((r) => r.default),
  },
});
