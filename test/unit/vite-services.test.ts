import { describe, expect, it } from "vitest";
import { viteServicesTemplate } from "../../src/build/vite/services.ts";
import type { NitroPluginContext } from "../../src/build/vite/types.ts";
import {
  lazyService,
  resolveServiceExport,
  resolveServiceFetch,
} from "../../src/runtime/internal/vite/service.mjs";

function template(opts: { dev?: boolean; services?: Record<string, string> } = {}) {
  const services = opts.services || { ssr: "/app/ssr.ts" };
  return viteServicesTemplate({
    services: Object.fromEntries(
      Object.entries(services).map(([name, entry]) => [name, { entry }])
    ),
    nitro: { options: { dev: !!opts.dev, rootDir: "/app", buildDir: "/app/.nitro" } },
    _entryPoints: Object.fromEntries(Object.keys(services).map((name) => [name, "index.mjs"])),
  } as unknown as NitroPluginContext);
}

describe("viteServicesTemplate", () => {
  it("dev: getters read globalThis.__nitro_vite_envs__", () => {
    const code = template({ dev: true });
    expect(code).toContain('get ["ssr"]() { return globalThis.__nitro_vite_envs__["ssr"] }');
    expect(code).not.toContain("lazyService");
  });

  it("prod: wraps each service entry with lazyService (entry relative to rootDir)", () => {
    const code = template({
      services: { ssr: "/app/ssr.ts", api: "./api/index.ts", virt: "virtual:api" },
    });
    expect(code).toContain('import { lazyService } from "#nitro/runtime/vite/service"');
    expect(code).toContain(
      '["ssr"]: lazyService(() => import("/app/.nitro/vite/services/ssr/index.mjs"), {"name":"ssr","entry":"ssr.ts"})'
    );
    expect(code).toContain(
      '["api"]: lazyService(() => import("/app/.nitro/vite/services/api/index.mjs"), {"name":"api","entry":"api/index.ts"})'
    );
    expect(code).toContain(
      '["virt"]: lazyService(() => import("/app/.nitro/vite/services/virt/index.mjs"), {"name":"virt","entry":"virtual:api"})'
    );
  });
});

describe("lazyService", () => {
  const ctx = { name: "ssr", entry: "ssr.ts" };

  it("loads the module once and preserves `this`", async () => {
    let loads = 0;
    const service = lazyService(async () => {
      loads++;
      return {
        default: {
          prefix: "ok:",
          fetch(req: Request) {
            return new Response(this.prefix + req.url);
          },
        },
      };
    }, ctx);
    const [res1, res2] = await Promise.all([
      service.fetch(new Request("http://localhost/1")),
      service.fetch(new Request("http://localhost/2")),
    ]);
    expect(await res1.text()).toBe("ok:http://localhost/1");
    expect(await res2.text()).toBe("ok:http://localhost/2");
    expect(await (await service.fetch(new Request("http://localhost/3"))).text()).toBe(
      "ok:http://localhost/3"
    );
    expect(loads).toBe(1);
  });

  it("reads the `fetch` property on every request", async () => {
    const app = { fetch: () => new Response("first") };
    const service = lazyService(async () => ({ default: app }), ctx);
    expect(await (await service.fetch(new Request("http://localhost/"))).text()).toBe("first");
    app.fetch = () => new Response("recompiled");
    expect(await (await service.fetch(new Request("http://localhost/"))).text()).toBe("recompiled");
  });

  it("does not cache a failed resolution", async () => {
    const mod: { fetch?: (req: Request) => Response } = {};
    let loads = 0;
    const service = lazyService(async () => {
      loads++;
      return mod;
    }, ctx);
    await expect(service.fetch(new Request("http://localhost/"))).rejects.toThrow(
      'Service "ssr" (ssr.ts) does not export a `fetch` handler'
    );
    mod.fetch = () => new Response("late");
    expect(await (await service.fetch(new Request("http://localhost/"))).text()).toBe("late");
    expect(loads).toBe(2);
  });

  // A real `import()` keeps rejecting once the module's evaluation failed (runtimes cache it);
  // the wrapper only has to make sure it asks the loader again.
  it("does not cache a rejected loader", async () => {
    let loads = 0;
    const service = lazyService(async () => {
      if (loads++ === 0) {
        throw new Error("boom");
      }
      return { fetch: () => new Response("ok") };
    }, ctx);
    await expect(service.fetch(new Request("http://localhost/"))).rejects.toThrow("boom");
    expect(await (await service.fetch(new Request("http://localhost/"))).text()).toBe("ok");
  });
});

describe("resolveServiceExport", () => {
  it("binds a `default` export method to its object", async () => {
    const mod = {
      default: {
        db: { end: async () => "ended" },
        async close() {
          return this.db.end();
        },
      },
    };
    expect(await resolveServiceExport(mod, "close")!()).toBe("ended");
  });

  it("falls back to the namespace export and returns undefined when missing", () => {
    const close = () => "named";
    expect(resolveServiceExport({ close }, "close")!()).toBe("named");
    expect(resolveServiceExport({ default: { close: true }, close }, "close")!()).toBe("named");
    expect(resolveServiceExport({ default: {} }, "close")).toBeUndefined();
    expect(resolveServiceExport(undefined, "close")).toBeUndefined();
  });
});

describe("resolveServiceFetch", () => {
  const ctx = { name: "ssr", entry: "/app/ssr.ts" };
  const req = new Request("http://localhost/");
  const text = (mod: unknown) => resolveServiceFetch(mod, ctx)(req).text();

  it("resolves `export default { fetch }` bound to the object", async () => {
    const mod = {
      default: {
        prefix: "default:",
        fetch(this: any, r: Request) {
          return new Response(this.prefix + r.url);
        },
      },
    };
    expect(await text(mod)).toBe("default:http://localhost/");
  });

  it("prefers `default.fetch` over a named `fetch` export", async () => {
    const mod = {
      default: { fetch: () => new Response("default") },
      fetch: () => new Response("named"),
    };
    expect(await text(mod)).toBe("default");
  });

  it("resolves `export function fetch`", async () => {
    expect(await text({ fetch: () => new Response("named") })).toBe("named");
  });

  it("falls back to the named export when the default has no callable fetch", async () => {
    const mod = { default: { fetch: "nope" }, fetch: () => new Response("named") };
    expect(await text(mod)).toBe("named");
    expect(await text({ default: null, fetch: () => new Response("named") })).toBe("named");
    expect(await text({ default: () => "render", fetch: () => new Response("named") })).toBe(
      "named"
    );
  });

  it("follows a `fetch` getter", async () => {
    let impl = () => new Response("a");
    const mod = {
      default: {
        get fetch() {
          return impl;
        },
      },
    };
    const fetch = resolveServiceFetch(mod, ctx);
    expect(await fetch(req).text()).toBe("a");
    impl = () => new Response("b");
    expect(await fetch(req).text()).toBe("b");
  });

  it.each([
    [
      { default: { buildId: "x", renderPage() {}, handleApiRoute() {} } },
      "object with keys [buildId, renderPage, handleApiRoute]",
    ],
    [{ default: {} }, "empty object"],
    [{ default: new (class Router {})() }, "empty Router instance"],
    [{ default: { fetch: "oops" } }, "`fetch` of type string"],
    [{ default: 42 }, "number"],
    [{ default: () => "render" }, "function"],
    [{ default: null, other: 1 }, "object with keys [default, other]"],
    [
      { default: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`k${i}`, i])) },
      "object with keys [k0, k1, k2, k3, k4, k5, k6, k7, k8, k9, ...]",
    ],
    [null, "null"],
  ])("describes %o", (mod, details) => {
    expect(() => resolveServiceFetch(mod, ctx)).toThrow(
      new TypeError(
        `[nitro] Service "ssr" (/app/ssr.ts) does not export a \`fetch\` handler (expected \`export default { fetch }\` or \`export function fetch\`, got ${details}).`
      )
    );
  });

  it("attaches the resolved module as cause", () => {
    const mod = { default: {} };
    let error: any;
    try {
      resolveServiceFetch(mod, ctx);
    } catch (e) {
      error = e;
    }
    expect(error.cause).toEqual({ resolved: mod });
  });
});
