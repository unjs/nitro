import fsp from 'node:fs/promises';
import { resolve } from "pathe";
import { describe, it, expect } from "vitest";
import { setupTest } from "../tests";

describe("nitro:preset:base-static", async () => {
  const ctx = await setupTest("base-static");
  it("should not generate a server folder", async () => {
    const contents = await fsp.readdir(resolve(ctx.outDir));
    expect(contents).toMatchInlineSnapshot(`
      [
        "nitro.json",
        "public",
      ]
    `)
  });
});
