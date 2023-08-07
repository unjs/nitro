import { promises as fsp } from "node:fs";
import { join, resolve } from "pathe";
import { Miniflare } from "miniflare";
import { describe, it, expect } from "vitest";
import { Response as _Response } from "undici";

import { setupTest, testNitro } from "../tests";

describe("nitro:preset:cloudflare-pages", async () => {
  const ctx = await setupTest("cloudflare-pages");

  testNitro(ctx, () => {
    const mf = new Miniflare({
      modules: true,
      scriptPath: resolve(ctx.outDir, "_worker.js"),
      globals: { __env__: {} },
      bindings: {
        ...ctx.env,
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

  it("should generate a _routes.json", async () => {
    const config = await fsp
      .readFile(resolve(ctx.outDir, "_routes.json"), "utf8")
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
