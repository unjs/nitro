import { resolve } from "pathe";
import { listen, Listener } from "listhen";
import destr from "destr";
import { fetch, FetchOptions } from "ofetch";
import { expect, it, afterAll, beforeAll, describe } from "vitest";
import { fileURLToPath } from "mlly";
import { joinURL } from "ufo";
import * as _nitro from "../src";
import type { Nitro } from "../src";

// Refactor: https://github.com/unjs/std-env/issues/60
const nodeVersion = Number.parseInt(process.versions.node.match(/^v?(\d+)/)[0]);

const { createNitro, build, prepare, copyPublicAssets, prerender } =
  (_nitro as any as { default: typeof _nitro }).default || _nitro;

export interface Context {
  preset: string;
  nitro?: Nitro;
  rootDir: string;
  outDir: string;
  fetch: (url: string, opts?: FetchOptions) => Promise<any>;
  server?: Listener;
  isDev: boolean;
  [key: string]: unknown;
}

// https://github.com/unjs/nitro/pull/1240
export const describeIf = (condition, title, factory) =>
  condition
    ? describe(title, factory)
    : describe(title, () => {
        it.skip("skipped", () => {});
      });

export async function setupTest(preset: string) {
  const fixtureDir = fileURLToPath(new URL("fixture", import.meta.url).href);

  const presetTempDir = fileURLToPath(
    new URL(`presets/.tmp/${preset}`, import.meta.url).href
  );

  const ctx: Context = {
    preset,
    isDev: preset === "nitro-dev",
    rootDir: fixtureDir,
    outDir: resolve(fixtureDir, presetTempDir, ".output"),
    fetch: (url, opts) =>
      fetch(joinURL(ctx.server!.url, url.slice(1)), {
        redirect: "manual",
        ...(opts as any),
      }),
  };

  const nitro = (ctx.nitro = await createNitro({
    preset: ctx.preset,
    dev: ctx.isDev,
    rootDir: ctx.rootDir,
    buildDir: resolve(fixtureDir, presetTempDir, ".nitro"),
    serveStatic:
      preset !== "cloudflare" &&
      preset !== "cloudflare-module" &&
      preset !== "cloudflare-pages" &&
      preset !== "vercel-edge" &&
      !ctx.isDev,
    output: {
      dir: ctx.outDir,
    },
    timing:
      preset !== "cloudflare" &&
      preset !== "cloudflare-pages" &&
      preset !== "vercel-edge",
  }));

  if (ctx.isDev) {
    // Setup development server
    const devServer = _nitro.createDevServer(ctx.nitro);
    ctx.server = await devServer.listen({});
    await prepare(ctx.nitro);
    const ready = new Promise<void>((resolve) => {
      ctx.nitro.hooks.hook("dev:reload", () => resolve());
    });
    await build(ctx.nitro);
    await ready;
  } else {
    // Production build
    await prepare(nitro);
    await copyPublicAssets(nitro);
    await prerender(nitro);
    await build(nitro);
  }

  afterAll(async () => {
    if (ctx.server) {
      await ctx.server.close();
    }
    if (ctx.nitro) {
      await ctx.nitro.close();
    }
  });

  return ctx;
}

export async function startServer(ctx: Context, handle) {
  ctx.server = await listen(handle);
  console.log(">", ctx.server!.url);
}

type TestHandlerResult = {
  data: any;
  status: number;
  headers: Record<string, string | string[]>;
};
type TestHandler = (options: any) => Promise<TestHandlerResult | Response>;

export function testNitro(
  ctx: Context,
  getHandler: () => TestHandler | Promise<TestHandler>,
  additionalTests?: (ctx: Context, callHandler: TestHandler) => void
) {
  let _handler: TestHandler;

  async function callHandler(options): Promise<TestHandlerResult> {
    const result = await _handler(options);
    if (result.constructor.name !== "Response") {
      return result as TestHandlerResult;
    }

    const headers: Record<string, string | string[]> = {};
    for (const [key, value] of (result as Response).headers.entries()) {
      if (headers[key]) {
        if (!Array.isArray(headers[key])) {
          headers[key] = [headers[key] as string];
        }
        if (Array.isArray(value)) {
          (headers[key] as string[]).push(...value);
        } else {
          (headers[key] as string[]).push(value);
        }
      } else {
        headers[key] = value;
      }
    }

    return {
      data: destr(await (result as Response).text()),
      status: result.status,
      headers,
    };
  }

  beforeAll(async () => {
    _handler = await getHandler();
  }, 25_000);

  it("API Works", async () => {
    const { data: helloData } = await callHandler({ url: "/api/hello" });
    expect(helloData).to.toMatchObject({ message: "Hello API" });

    const { data: heyData } = await callHandler({ url: "/api/hey" });
    expect(heyData).to.have.string("Hey API");

    const { data: kebabData } = await callHandler({ url: "/api/kebab" });
    expect(kebabData).to.have.string("hello-world");

    const { data: paramsData } = await callHandler({
      url: "/api/param/test_param",
    });
    expect(paramsData).toBe("test_param");

    const { data: paramsData2 } = await callHandler({
      url: "/api/wildcard/foo/bar/baz",
    });
    expect(paramsData2).toBe("foo/bar/baz");
  });

  it("Handle 404 not found", async () => {
    const res = await callHandler({ url: "/api/not-found" });
    expect(res.status).toBe(404);
  });

  it("Handle 405 method not allowed", async () => {
    const res = await callHandler({ url: "/api/upload" });
    expect(res.status).toBe(405);
  });

  it("handles route rules - redirects", async () => {
    const base = await callHandler({ url: "/rules/redirect" });
    expect(base.status).toBe(307);
    expect(base.headers.location).toBe("/base");

    const obj = await callHandler({ url: "/rules/redirect/obj" });
    expect(obj.status).toBe(308);
    expect(obj.headers.location).toBe("https://nitro.unjs.io/");
  });

  // aws lambda requires buffer responses to be base 64
  const LambdaPresets = ["netlify", "aws-lambda"];
  it.runIf(LambdaPresets.includes(ctx.preset))(
    "buffer image responses",
    async () => {
      const { data } = await callHandler({ url: "/icon.png" });
      expect(typeof data).toBe("string");
      const buffer = Buffer.from(data, "base64");
      // check if buffer is a png
      function isBufferPng(buffer: Buffer) {
        return (
          buffer[0] === 0x89 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x4e &&
          buffer[3] === 0x47
        );
      }
      expect(isBufferPng(buffer)).toBe(true);
    }
  );

  it("render JSX", async () => {
    const { data } = await callHandler({ url: "/jsx" });
    expect(data).toMatch("<h1 >Hello JSX!</h1>");
  });

  it("handles route rules - headers", async () => {
    const { headers } = await callHandler({ url: "/rules/headers" });
    expect(headers["cache-control"]).toBe("s-maxage=60");
  });

  it("handles route rules - cors", async () => {
    const expectedHeaders = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET",
      "access-control-allow-headers": "*",
      "access-control-max-age": "0",
    };
    const { headers } = await callHandler({ url: "/rules/cors" });
    expect(headers).toMatchObject(expectedHeaders);
  });

  it("handles route rules - allowing overriding", async () => {
    const override = await callHandler({ url: "/rules/nested/override" });
    expect(override.headers.location).toBe("/other");
    expect(override.headers["x-test"]).toBe("test");

    const base = await callHandler({ url: "/rules/nested/base" });
    expect(base.headers.location).toBe("/base");
    expect(base.headers["x-test"]).toBe("test");
  });

  it("handles errors", async () => {
    const { status } = await callHandler({
      url: "/api/error",
      headers: {
        Accept: "application/json",
      },
    });
    expect(status).toBe(503);
    const { data: heyData } = await callHandler({ url: "/api/hey" });
    expect(heyData).to.have.string("Hey API");
  });

  it("universal import.meta", async () => {
    const { status, data } = await callHandler({ url: "/api/import-meta" });
    expect(status).toBe(200);
    expect(data.testFile).toMatch(/[/\\]test.txt$/);
    expect(data.hasEnv).toBe(true);
  });

  it("handles custom server assets", async () => {
    const { data: html, status: htmlStatus } = await callHandler({
      url: "/file?filename=index.html",
    });
    const { data: txtFile, status: txtStatus } = await callHandler({
      url: "/file?filename=test.txt",
    });
    expect(htmlStatus).toBe(200);
    expect(html).toContain("<h1>nitro is amazing!</h1>");
    expect(txtStatus).toBe(200);
    expect(txtFile).toContain("this is an asset from a text file from nitro");
  });

  if (ctx.nitro!.options.serveStatic) {
    it("serve static asset /favicon.ico", async () => {
      const { status, headers } = await callHandler({ url: "/favicon.ico" });
      expect(status).toBe(200);
      expect(headers.etag).toBeDefined();
      expect(headers["content-type"]).toMatchInlineSnapshot(
        '"image/vnd.microsoft.icon"'
      );
    });

    it("serve static asset /build/test.txt", async () => {
      const { status, headers } = await callHandler({ url: "/build/test.txt" });
      expect(status).toBe(200);
      expect(headers.etag).toMatchInlineSnapshot(
        '"\\"7-vxGfAKTuGVGhpDZqQLqV60dnKPw\\""'
      );
      expect(headers["content-type"]).toMatchInlineSnapshot(
        '"text/plain; charset=utf-8"'
      );
    });

    it("shows 404 for /build/non-file", async () => {
      const { status } = await callHandler({ url: "/build/non-file" });
      expect(status).toBe(404);
    });

    it("find auto imported utils", async () => {
      const res = await callHandler({ url: "/imports" });
      expect(res.data).toMatchInlineSnapshot(`
        {
          "testUtil": 123,
        }
      `);
    });

    it.skipIf(ctx.preset === "deno-server")(
      "resolve module version conflicts",
      async () => {
        const { data } = await callHandler({ url: "/modules" });
        expect(data).toMatchObject({
          depA: "@fixture/nitro-lib@1.0.0+@fixture/nested-lib@1.0.0",
          depB: "@fixture/nitro-lib@2.0.1+@fixture/nested-lib@2.0.1",
          depLib: "@fixture/nitro-lib@2.0.0+@fixture/nested-lib@2.0.0",
          subpathLib: "@fixture/nitro-lib@2.0.0",
          extraUtils: "@fixture/nitro-utils/extra",
        });
      }
    );

    it("useStorage (with base)", async () => {
      const putRes = await callHandler({
        url: "/api/storage/item?key=test:hello",
        method: "PUT",
        body: "world",
      });
      expect(putRes.data).toMatchObject("world");

      expect(
        (
          await callHandler({
            url: "/api/storage/item?key=:",
          })
        ).data
      ).toMatchObject(["test:hello"]);

      expect(
        (
          await callHandler({
            url: "/api/storage/item?base=test&key=:",
          })
        ).data
      ).toMatchObject(["hello"]);

      expect(
        (
          await callHandler({
            url: "/api/storage/item?base=test&key=hello",
          })
        ).data
      ).toBe("world");
    });

    if (additionalTests) {
      additionalTests(ctx, callHandler);
    }
  }

  it("runtime proxy", async () => {
    const { data } = await callHandler({
      url: "/api/proxy?foo=bar",
      headers: {
        "x-test": "foobar",
      },
    });
    expect(data.headers["x-test"]).toBe("foobar");
    expect(data.url).toBe("/api/echo?foo=bar");
  });

  it("config", async () => {
    const { data } = await callHandler({
      url: "/config",
    });
    expect(data).toMatchObject({
      appConfig: {
        dynamic: "from-middleware",
        "app-config": true,
        "nitro-config": true,
        "server-config": true,
      },
      runtimeConfig: {
        dynamic: "from-env",
        app: {
          baseURL: "/",
        },
      },
      sharedAppConfig: {
        dynamic: "initial",
        "app-config": true,
        "nitro-config": true,
        "server-config": true,
      },
      sharedRuntimeConfig: {
        dynamic:
          // TODO
          ctx.preset.includes("cloudflare") ||
          ctx.preset === "vercel-edge" ||
          ctx.preset === "nitro-dev"
            ? "initial"
            : "from-env",
        app: {
          baseURL: "/",
        },
      },
    });
  });

  if (ctx.nitro!.options.timing) {
    it("set server timing header", async () => {
      const { data, status, headers } = await callHandler({
        url: "/api/hello",
      });
      expect(status).toBe(200);
      expect(headers["server-timing"]).toMatch(/-;dur=\d+;desc="Generate"/);
    });
  }

  it("static build flags", async () => {
    const { data } = await callHandler({ url: "/static-flags" });
    expect(data).toMatchObject({
      dev: [ctx.isDev, ctx.isDev],
      preset: [ctx.preset, ctx.preset],
      prerender: [
        ctx.preset === "nitro-prerenderer",
        ctx.preset === "nitro-prerenderer",
      ],
      client: [false, false],
      nitro: [true, true],
      server: [true, true],
      "versions.nitro": [expect.any(String), expect.any(String)],
      "versions?.nitro": [expect.any(String), expect.any(String)],
    });
  });

  it("event.waitUntil", async () => {
    const res = await callHandler({ url: "/wait-until" });
    expect(res.data).toBe("done");
  });

  describe("ignore", () => {
    it("server routes should be ignored", async () => {
      expect((await callHandler({ url: "/api/_ignored" })).status).toBe(404);
      expect((await callHandler({ url: "/_ignored" })).status).toBe(404);
    });

    it.skipIf(
      [
        "nitro-dev",
        "cloudflare",
        "cloudflare-pages",
        "cloudflare-module",
        "vercel-edge",
      ].includes(ctx.preset)
    )("public files should be ignored", async () => {
      expect((await callHandler({ url: "/_ignored.txt" })).status).toBe(404);
      expect((await callHandler({ url: "/favicon.ico" })).status).toBe(200);
    });
  });

  describe("headers", () => {
    it("handles headers correctly", async () => {
      const { headers } = await callHandler({ url: "/api/headers" });
      expect(headers["content-type"]).toBe("text/html");
      expect(headers["x-foo"]).toBe("bar");
      expect(headers["x-array"]).toMatch(/^foo,\s?bar$/);

      let expectedCookies: string | string[] = [
        "foo=bar",
        "bar=baz",
        "test=value; Path=/",
        "test2=value; Path=/",
      ];

      // TODO: Node presets do not split cookies
      // https://github.com/unjs/nitro/issues/1462
      // (vercel and deno-server uses node only for tests only)
      const notSplitingPresets = ["node", "nitro-dev", "vercel", nodeVersion < 18 && "deno-server"].filter(Boolean);
      if (notSplitingPresets.includes(ctx.preset)) {
        expectedCookies =
          nodeVersion < 18
            ? "foo=bar, bar=baz, test=value; Path=/, test2=value; Path=/"
            : ["foo=bar, bar=baz", "test=value; Path=/", "test2=value; Path=/"];
      }

      // TODO: verce-ledge joins all cookies for some reason!
      if (ctx.preset === "vercel-edge") {
        expectedCookies =
          "foo=bar, bar=baz, test=value; Path=/, test2=value; Path=/";
      }

      // Aws lambda v1
      if (ctx.preset === "aws-lambda" && ctx.lambdaV1) {
        expectedCookies =
          "foo=bar, bar=baz,test=value; Path=/,test2=value; Path=/";
      }

      // TODO: Bun does not handles set-cookie at all
      // https://github.com/unjs/nitro/issues/1461
      if (["bun"].includes(ctx.preset)) {
        return;
      }

      expect(headers["set-cookie"]).toMatchObject(expectedCookies);
    });
  });

  describe("errors", () => {
    it("captures errors", async () => {
      const { data } = await callHandler({ url: "/api/errors" });
      const allErrorMessages = (data.allErrors || []).map(
        (entry) => entry.message
      );
      expect(allErrorMessages).to.includes("Service Unavailable");
    });
  });

  describe("prerender", () => {
    it("renders prerenderer finished file", async () => {
      const { data } = await callHandler({ url: "/routes.txt" });
      expect(data.startsWith('Routes:') && data.includes('/')).toBe(true);
    });
  });
}
