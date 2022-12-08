import { resolve } from "pathe";
import { describe } from "vitest";
import { startServer, setupTest, testNitro } from "../tests";

describe("nitro:preset:node", async () => {
  const ctx = await setupTest("node");
  testNitro(ctx, async () => {
    const { listener } = await import(resolve(ctx.outDir, "server/index.mjs"));
    await startServer(ctx, listener);
    return async ({ url }) => {
      const res = await ctx.fetch(url);
      return res;
    };
  });
});
