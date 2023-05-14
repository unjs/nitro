import { resolve } from "pathe";
import { Miniflare } from "miniflare";
import { describe } from "vitest";

import { setupTest, testNitro } from "../tests";

describe("nitro:preset:cloudflare-module", async () => {
  const ctx = await setupTest("cloudflare-module");

  testNitro(ctx, () => {
    const mf = new Miniflare({
      modules: true,
      scriptPath: resolve(ctx.outDir, "server/index.mjs"),
      sitePath: resolve(ctx.outDir, "public"),
    });

    return async ({ url, headers, method, body }) => {
      const res = await mf.dispatchFetch("http://localhost" + url, {
        headers: headers || {},
        method: method || "GET",
        body,
      });
      return res as unknown as Response;
    };
  });
});
