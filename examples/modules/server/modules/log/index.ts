import { fileURLToPath } from "node:url";

export default defineNitroModule({
  name: "log",
  setup: (nitro) => {
    const resolve = (path: string) =>
      fileURLToPath(new URL(path, import.meta.url));

    nitro.options.handlers ||= [];
    nitro.options.handlers.push({
      handler: resolve("runtime/middleware/log.ts"),
    });
  },
});
