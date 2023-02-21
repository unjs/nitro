import { promises as fsp } from "node:fs";
import { resolve } from "pathe";
import { Miniflare } from "miniflare";
import { describe, it, expect } from "vitest";

import { setupTest, testNitro } from "../tests";

describe("nitro:preset:cloudflare", async () => {
  const ctx = await setupTest("cloudflare");
  testNitro(ctx, () => {
    const mf = new Miniflare({
      scriptPath: resolve(ctx.outDir, "server/index.mjs"),
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

describe("nitro:preset:cloudflare-pages", async () => {
  const ctx = await setupTest("cloudflare-pages");

  it("should generate a _routes.json", async () => {
    const config = await fsp
      .readFile(resolve(ctx.outDir, "public/_routes.json"), "utf8")
      .then((r) => JSON.parse(r));
    expect(config).toMatchInlineSnapshot(`
      {
        "exclude": [
          "/build/*",
          "/favicon.ico",
          "/icon.png",
          "/api/hello",
          "/prerender/index.html",
          "/prerender/index.html.br",
          "/prerender/index.html.gz",
          "/api/hey/index.html",
          "/api/param/foo.json/index.html",
          "/api/param/prerender1/index.html",
          "/api/param/prerender3/index.html",
          "/api/param/prerender4/index.html",
        ],
        "include": [
          "/*",
        ],
        "version": 1,
      }
    `);
  });
});
