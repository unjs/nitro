import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { describe, expect, it } from "vitest";
import { handlersMeta } from "../../src/rollup/plugins/handlers-meta";

describe("handlers-meta:load", () => {
  // The `?meta` specifier is resolved by the host bundler before our
  // `resolveId` runs, so `resolved.id` can come back as a `file://` URL for
  // handler files outside the project root (e.g. server routes in Nuxt
  // layers, https://github.com/nitrojs/nitro/issues/4564). The virtual id we
  // build from it is then loaded with `readFile`, which does not understand
  // URL strings and fails with ENOENT even though the file exists.
  function setupFixture() {
    const rootDir = mkdtempSync(join(tmpdir(), "nitro-handlers-meta-"));
    const handlerPath = join(
      rootDir,
      "packages",
      "Payment",
      "server",
      "api",
      "payment",
      "bankRegister2.post.js"
    );
    mkdirSync(join(handlerPath, ".."), { recursive: true });
    writeFileSync(handlerPath, "export default () => 'ok'\n");
    return { rootDir, handlerPath };
  }

  function pluginDriver(resolvedId: string) {
    const plugin = handlersMeta({ logger: { warn: () => {} } } as any) as any;
    return plugin.load.call(
      { load: async ({ id }: { id: string }) => readFileSync(id, "utf8") },
      `\0nitro-handler-meta:${resolvedId}`
    );
  }

  it("loads a handler staged under a plain absolute path", async () => {
    const { rootDir, handlerPath } = setupFixture();
    writeFileSync(
      join(rootDir, "dummy.js"),
      "// ensures rootDir exists before assertions\n"
    );
    const code = await pluginDriver(handlerPath);
    expect(code).toContain("ok");
  });

  it("loads a handler staged under a file:// URL (Nuxt layer)", async () => {
    const { rootDir, handlerPath } = setupFixture();
    writeFileSync(
      join(rootDir, "dummy.js"),
      "// ensures rootDir exists before assertions\n"
    );
    const code = await pluginDriver(`file://${handlerPath}`);
    expect(code).toContain("ok");
  });
});
