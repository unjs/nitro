import { describe, it, expect } from "vitest";
import { setupTest, testNitro } from "../tests";

describe("nitro:preset:nitro-dev", async () => {
  const ctx = await setupTest("nitro-dev");
  testNitro(
    ctx,
    () => {
      return async ({ url, headers, method, body }) => {
        const res = await ctx.fetch(url, {
          headers,
          method,
          body,
        });
        return res;
      };
    },
    (_ctx, callHandler) => {
      it("returns correct status for devProxy", async () => {
        const { status } = await callHandler({ url: "/proxy/example" });
        expect(status).toBe(200);
      });
    }
  );
});
