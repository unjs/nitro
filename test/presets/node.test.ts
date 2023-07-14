import { existsSync } from "node:fs";
import { resolve } from "pathe";
import { describe, it, expect } from "vitest";
import { startServer, setupTest, testNitro } from "../tests";

describe("nitro:preset:node", async () => {
  const ctx = await setupTest("node");

  testNitro(ctx, async () => {
    const { listener } = await import(resolve(ctx.outDir, "server/index.mjs"));
    await startServer(ctx, listener);
    return async ({ url, ...opts }) => {
      const res = await ctx.fetch(url, opts);
      return res;
    };
  });

  it("should handle nested cached route rules", async () => {
    const cached = await ctx.fetch("/rules/_/noncached/cached");
    expect(cached.headers.get("etag")).toBeDefined();

    const noncached = await ctx.fetch("/rules/_/noncached/noncached");
    expect(noncached.headers.get("etag")).toBeNull();

    const cached2 = await ctx.fetch("/rules/_/cached/cached");
    expect(cached2.headers.get("etag")).toBeDefined();

    const noncached2 = await ctx.fetch("/rules/_/cached/noncached");
    expect(noncached2.headers.get("etag")).toBeNull();
  });

  it("should not bundle externals", () => {
    const serverNodeModules = resolve(ctx.outDir, "server/node_modules");
    expect(
      existsSync(resolve(serverNodeModules, "@fixture/nitro-utils/extra.mjs"))
    ).toBe(true);
  });
});
