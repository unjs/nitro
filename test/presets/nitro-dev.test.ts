import { describe } from "vitest";
import { setupTest, testNitro } from "../tests";

describe("nitro:preset:nitro-dev", async () => {
  const ctx = await setupTest("nitro-dev");
  testNitro(ctx, () => {
    return async ({ url }) => {
      const res = await ctx.fetch(url);
      return res;
    };
  });
});
