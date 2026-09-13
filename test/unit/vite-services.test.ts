import { describe, expect, it } from "vitest";
import { viteServicesTemplate } from "../../src/build/vite/services.ts";
import type { NitroPluginContext } from "../../src/build/vite/types.ts";
import { resolveServiceFetch } from "../../src/runtime/internal/vite/service.mjs";

function template(opts: { dev?: boolean; services?: string[] } = {}) {
  const names = opts.services || ["ssr"];
  return viteServicesTemplate({
    services: Object.fromEntries(names.map((name) => [name, { entry: `/app/${name}.ts` }])),
    nitro: { options: { dev: !!opts.dev, buildDir: "/app/.nitro" } },
    _entryPoints: Object.fromEntries(names.map((name) => [name, "index.mjs"])),
  } as unknown as NitroPluginContext);
}

describe("viteServicesTemplate", () => {
  it("dev: getters read globalThis.__nitro_vite_envs__", () => {
    const code = template({ dev: true });
    expect(code).toContain('get ["ssr"]() { return globalThis.__nitro_vite_envs__["ssr"] }');
    expect(code).not.toContain("lazyService");
  });

  it("prod: wraps each service entry with lazyService", () => {
    const code = template({ services: ["ssr", "api"] });
    expect(code).toContain('import { resolveServiceFetch } from "#nitro/runtime/vite/service"');
    expect(code).toContain(
      '["ssr"]: lazyService("ssr", "/app/ssr.ts", () => import("/app/.nitro/vite/services/ssr/index.mjs"))'
    );
    expect(code).toContain(
      '["api"]: lazyService("api", "/app/api.ts", () => import("/app/.nitro/vite/services/api/index.mjs"))'
    );
  });
});

describe("lazyService", () => {
  function lazyService(loader: () => Promise<unknown>) {
    const code = template()
      .replace(/^import .*$/m, "")
      .replace(/export const viteServices = \{[\s\S]*$/, "");
    const fn = new Function(
      "resolveServiceFetch",
      "loader",
      `${code}; return lazyService("ssr", "/app/ssr.ts", loader)`
    );
    return fn(resolveServiceFetch, loader) as { fetch: (req: Request) => Promise<Response> };
  }

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
    });
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

  it("does not cache a failed resolution", async () => {
    const mod: { fetch?: (req: Request) => Response } = {};
    let loads = 0;
    const service = lazyService(async () => {
      loads++;
      return mod;
    });
    await expect(service.fetch(new Request("http://localhost/"))).rejects.toThrow(
      'Service "ssr" (/app/ssr.ts) does not export a `fetch` handler'
    );
    mod.fetch = () => new Response("late");
    expect(await (await service.fetch(new Request("http://localhost/"))).text()).toBe("late");
    expect(loads).toBe(2);
  });

  it("does not cache a failed load", async () => {
    let loads = 0;
    const service = lazyService(async () => {
      if (loads++ === 0) {
        throw new Error("boom");
      }
      return { fetch: () => new Response("ok") };
    });
    await expect(service.fetch(new Request("http://localhost/"))).rejects.toThrow("boom");
    expect(await (await service.fetch(new Request("http://localhost/"))).text()).toBe("ok");
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

  it("resolves `export default function`", async () => {
    expect(await text({ default: () => new Response("fn") })).toBe("fn");
  });

  it("resolves `export function fetch`", async () => {
    expect(await text({ fetch: () => new Response("named") })).toBe("named");
  });

  it("falls back to the named export when the default has no callable fetch", async () => {
    const mod = { default: { fetch: "nope" }, fetch: () => new Response("named") };
    expect(await text(mod)).toBe("named");
    expect(await text({ default: null, fetch: () => new Response("named") })).toBe("named");
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
    [{ default: null, other: 1 }, "object with keys [default, other]"],
    [
      { default: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`k${i}`, i])) },
      "object with keys [k0, k1, k2, k3, k4, k5, k6, k7, k8, k9, ...]",
    ],
    [null, "null"],
  ])("describes %o", (mod, details) => {
    expect(() => resolveServiceFetch(mod, ctx)).toThrow(
      new TypeError(
        `[nitro] Service "ssr" (/app/ssr.ts) does not export a \`fetch\` handler (expected \`export default { fetch }\`, \`export default function\` or \`export function fetch\`, got ${details}).`
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
