import { promises as fsp } from "node:fs";
import { resolve } from "pathe";
import { describe, it, expect } from "vitest";
import { EdgeRuntime } from "edge-runtime";
import { setupTest, startServer, testNitro } from "../tests";

describe("nitro:preset:vercel-edge", async () => {
  const ctx = await setupTest("vercel-edge");
  testNitro(ctx, async () => {
    // TODO: Add add-event-listener
    const entry = resolve(ctx.outDir, "functions/__nitro.func/index.mjs");
    const initialCode = await fsp.readFile(entry, "utf8");
    const runtime = new EdgeRuntime();
    runtime.evaluate(
      initialCode.replace(
        "export{handleEvent as default}",
        "globalThis.handleEvent = handleEvent"
      )
    );
    return async ({ url, headers }) => {
      const res = await runtime.evaluate(
        `handleEvent({
          url: new URL("http://localhost${url}"),
          headers: new Headers(${JSON.stringify(headers || {})})
        })`
      );
      return res;
    };
  });
});
