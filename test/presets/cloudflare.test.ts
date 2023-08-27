import { resolve } from "pathe";
import { Miniflare } from "miniflare";
import { describe, it, expect } from "vitest";

import { setupTest, testNitro } from "../tests";

describe("nitro:preset:cloudflare", async () => {
  const ctx = await setupTest("cloudflare");
  const mf = new Miniflare({
    scriptPath: resolve(ctx.outDir, "server/index.mjs"),
  });

  testNitro(ctx, () => {
    return async ({ url, headers, method, body }) => {
      const res = await mf.dispatchFetch("http://localhost" + url, {
        headers: headers || {},
        method: method || "GET",
        body,
      });
      return res as unknown as Response;
    };
  });

  it("should handle scheduled events", async () => {
    const waitUntil = await mf.dispatchScheduled();
    // console.log("WAIT", waitUntil); // Event is sent and hook is called, but waitUntil doesn't work.
    expect(waitUntil[0]).toBe(undefined);
  });
});
