#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { version } from "../../package.json";

const main = defineCommand({
  meta: {
    name: "nitro",
    description: "Nitro CLI",
    version,
  },
  subCommands: {
    dev: () => import("./commands/dev").then((r) => r.default),
    build: () => import("./commands/build").then((r) => r.default),
    prepare: () => import("./commands/prepare").then((r) => r.default),
  },
});

runMain(main);
