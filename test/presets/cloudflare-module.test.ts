import { promises as fsp } from "node:fs";
import { join, resolve } from "pathe";
import { Miniflare } from "miniflare";
import { describe, it, expect } from "vitest";
import { Response as _Response } from "undici";

import { setupTest, testNitro } from "../tests";

describe("nitro:preset:cloudflare-module", async () => {
  const ctx = await setupTest("cloudflare-module");

  testNitro(ctx, () => {
    const mf = new Miniflare({
      modules: true,
      scriptPath: resolve(ctx.outDir, "_worker.js"),
      bindings: {
        ASSETS: {
          fetch: async (request) => {
            const contents = await fsp.readFile(
              join(ctx.outDir, new URL(request.url).pathname)
            );
            return new _Response(contents);
          },
        },
      },
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
