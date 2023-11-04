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
      compatibilityFlags: ["streams_enable_constructors"],
      bindings: {
        ...ctx.env,
        ASSETS: {
          fetch: async (request) => {
            try {
              const contents = await fsp.readFile(
                join(ctx.outDir, new URL(request.url).pathname)
              );
              return new _Response(contents);
            } catch {
              return new _Response(null, { status: 404 });
            }
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
          "/blog/static/*",
          "/build/*",
          "/favicon.ico",
          "/icon.png",
          "/api/hello",
          "/prerender/index.html",
          "/prerender/index.html.br",
          "/prerender/index.html.gz",
          "/api/hey/index.html",
          "/api/param/foo.json",
          "/api/param/hidden",
          "/api/param/prerender1",
          "/api/param/prerender3",
          "/api/param/prerender4",
        ],
        "include": [
          "/*",
          "/api/*",
          "/blog/*",
        ],
        "version": 1,
      }
    `);
  });
});
