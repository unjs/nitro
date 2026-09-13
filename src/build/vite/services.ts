import type { NitroPluginContext } from "./types.ts";
import type { Plugin as VitePlugin } from "vite";
import { relative, resolve } from "pathe";

export function viteServicesTemplate(ctx: NitroPluginContext): string {
  const serviceNames = Object.keys(ctx.services);

  if (ctx.nitro!.options.dev) {
    return /* js */ `
export const viteServices = {
${serviceNames
  .map(
    (name) =>
      `  get [${JSON.stringify(name)}]() { return globalThis.__nitro_vite_envs__[${JSON.stringify(name)}] }`
  )
  .join(",\n")}
};
  `;
  }

  const serviceEntries = serviceNames.map((name) => {
    const entry = resolve(
      ctx.nitro!.options.buildDir,
      "vite/services",
      name,
      ctx._entryPoints[name]
    );
    return [name, entry];
  });

  return /* js */ `
import { resolveServiceFetch } from "#nitro/runtime/vite/service";

function lazyService(name, entry, loader) {
  let promise, handler
  return {
    fetch(req) {
      if (handler) { return handler(req) }
      promise ??= loader()
        .then(mod => (handler = resolveServiceFetch(mod, { name, entry })))
        .catch(error => { promise = undefined; throw error })
      return promise.then(handler => handler(req))
    }
  }
}

export const viteServices = {
${serviceEntries
  .map(
    ([name, entry]) =>
      `[${JSON.stringify(name)}]: lazyService(${JSON.stringify(name)}, ${JSON.stringify(relative(ctx.nitro!.options.rootDir, ctx.services[name].entry))}, () => import(${JSON.stringify(entry)}))`
  )
  .join(",\n")}
};
  `;
}

// Service environments (e.g. SSR) must not bundle their own copy of `nitro/*`
// runtime modules. In dev, imports are proxied to the Nitro environment via
// __VITE_ENVIRONMENT_RUNNER_IMPORT__. In prod, they are externalized (see createServiceEnvironment).
const NITRO_PROXY_PREFIX = "\0nitro-env-proxy:";
export function nitroDevServiceProxy(): VitePlugin {
  return {
    name: "nitro:dev-service-proxy",
    enforce: "pre",
    applyToEnvironment: (env) => env.name !== "nitro" && env.config.consumer === "server",
    apply: (_config, configEnv) => configEnv.command === "serve",

    resolveId: {
      filter: { id: /^nitro(\/|$)/ },
      handler(id) {
        if (id === "nitro" || id.startsWith("nitro/")) {
          return { id: NITRO_PROXY_PREFIX + id, moduleSideEffects: false };
        }
      },
    },

    load: {
      filter: { id: /^\0nitro-env-proxy:/ },
      handler(id) {
        if (!id.startsWith(NITRO_PROXY_PREFIX)) {
          return;
        }
        const originalId = id.slice(NITRO_PROXY_PREFIX.length);
        // __vite_ssr_exportAll__ is provided by the module runner execution context.
        // It re-exports all enumerable own properties (except "default") from the source module.
        return {
          code: [
            `const _mod = await globalThis.__VITE_ENVIRONMENT_RUNNER_IMPORT__("nitro", ${JSON.stringify(originalId)});`,
            `__vite_ssr_exportAll__(_mod);`,
            `export default _mod.default;`,
          ].join("\n"),
          map: null,
        };
      },
    },
  };
}
