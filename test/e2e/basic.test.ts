import { resolve } from "pathe";
import { describe, it, expect } from "vitest";
import { startServer, setupTest } from "../tests";

describe("nitro modules", async () => {
  const ctx = await setupTest("node");

  const entryPath = resolve(ctx.outDir, "server/index.mjs");
  const { listener } = await import(entryPath);

  await startServer(ctx, listener);

  it("should inject using node_modules", async () => {
    const res = await ctx.fetch("/node-modules/module-plugin");
    expect(await res.text()).toBe("injected by a module from the node_modules");
  });

  it("should inject using a relative path", async () => {
    const res = await ctx.fetch("/manual-module/module-plugin");
    expect(await res.text()).toBe("injected by a module specified by the user");
  });
});
