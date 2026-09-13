import { rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { toRequest } from "h3";
import { join } from "pathe";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const { createBuilder, createLogger, createServer } = (await import(
  process.env.NITRO_VITE_PKG || "vite"
)) as typeof import("vite");

// #4606: dev and prod resolve a service entry's `fetch` handler the same way (the `default`
// export wins over a `fetch` helper hoisted onto the entry chunk), and an entry without one is
// reported at build time and with a clear runtime error instead of `mod.fetch is not a function`.
describe("vite: service fetch handler", { sequential: true }, () => {
  const rootDir = fileURLToPath(new URL("./service-fetch-fixture", import.meta.url));
  const originalCwd = process.cwd();

  beforeAll(async () => {
    process.chdir(rootDir);
    process.env.NITRO_PRESET = "standard";
    await rm(join(rootDir, ".output"), { recursive: true, force: true });
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    delete process.env.NITRO_PRESET;
  });

  async function build(configFile: string) {
    const warnings: string[] = [];
    const logger = createLogger("warn", { allowClearScreen: false });
    const warn = logger.warn;
    logger.warn = (msg, opts) => {
      warnings.push(msg);
      warn(msg, opts);
    };
    const builder = await createBuilder({ root: rootDir, configFile, customLogger: logger });
    await builder.buildApp();
    delete (globalThis as any).__nitro__;
    return { warnings };
  }

  async function load(dir: string) {
    const { default: entry } = await import(
      pathToFileURL(join(rootDir, ".output", dir, "server/index.mjs")).href
    );
    return (input: string) => entry.fetch(toRequest(input)) as Promise<Response>;
  }

  test("dev: prefers `default.fetch` over a named `fetch` export", async () => {
    const server = await createServer({
      root: rootDir,
      configFile: join(rootDir, "vite.config.ts"),
      logLevel: "warn",
    });
    try {
      await server.listen("0" as unknown as number);
      const addr = server.httpServer!.address() as { port: number };
      const res = await fetch(`http://localhost:${addr.port}/`);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe(`rendered:http://localhost:${addr.port}/:function:function`);
    } finally {
      await server.close();
      delete (globalThis as any).__nitro__;
    }
  }, 60_000);

  test("prod: prefers `default.fetch` over a named `fetch` hoisted onto the entry chunk", async () => {
    const { warnings } = await build(join(rootDir, "vite.config.ts"));
    expect(warnings.filter((w) => w.includes("exports neither"))).toEqual([]);
    const fetch = await load("good");
    const res = await fetch("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("rendered:http://localhost/:function:function");
  }, 60_000);

  test("reports an entry without a fetch handler at build and request time", async () => {
    const { warnings } = await build(join(rootDir, "vite.config.bad.ts"));
    expect(
      warnings.some((w) =>
        /Service "ssr" entry \(.*entry-bad\.ts\) exports neither `default` nor `fetch` \(got: buildId, renderPage\)/.test(
          w
        )
      )
    ).toBe(true);
    const fetch = await load("bad");
    const res = await fetch("/");
    expect(res.status).toBe(500);
    const consoleError = console.error;
    const errors: unknown[] = [];
    console.error = (...args) => errors.push(...args);
    try {
      await fetch("/");
    } finally {
      console.error = consoleError;
    }
    expect(errors.map(String).join("\n")).toContain(
      'Service "ssr" (app/entry-bad.ts) does not export a `fetch` handler'
    );
  }, 60_000);
});
