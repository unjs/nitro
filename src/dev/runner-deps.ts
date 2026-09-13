import type { RunnerName } from "env-runner";
import type { Nitro } from "nitro/types";

import { pathToFileURL } from "node:url";
import { resolveModulePath } from "exsolve";
import { resolve } from "pathe";
import { findNearestFile } from "pkg-types";
import { ensureDep } from "../utils/dep.ts";

export interface MiniflareRunnerDeps {
  miniflare?: URL;
  wranglerModule?: URL;
  wrangler?: string | Record<string, unknown> | false;
  wranglerEnv?: string;
  miniflareOptions?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Resolve the platform packages a dev runner needs from the user project.
 *
 * Runners do not import these packages themselves: each one is passed as an
 * explicit option so the version installed next to the app is the version that
 * runs. Unresolved entries are left out and the runner falls back to its own
 * optional import (or a degraded mode).
 */
export async function resolveRunnerDeps(
  nitro: Nitro,
  runner: RunnerName
): Promise<Record<string, unknown>> {
  switch (runner) {
    case "miniflare": {
      return resolveMiniflareDeps(nitro);
    }
    case "netlify": {
      // `@netlify/runtime` is instantiated inside the worker thread, so it can
      // only be handed over as a specifier, never as an imported module.
      return { netlifyRuntime: _resolve("@netlify/runtime", nitro.options.rootDir) };
    }
    default: {
      return {};
    }
  }
}

export async function resolveMiniflareDeps(nitro: Nitro): Promise<MiniflareRunnerDeps> {
  const miniflare = await ensureDep({
    id: "miniflare",
    dir: nitro.options.rootDir,
    reason: "the `miniflare` dev runner",
    version: "^4",
  });
  const miniflareURL = miniflare ? pathToFileURL(miniflare) : undefined;
  return {
    miniflare: miniflareURL,
    // Optional: without it, a built-in minimal reader handles plain JSON
    // wrangler configs and inline objects.
    wranglerModule: _resolve("wrangler", nitro.options.rootDir),
    ...(await _resolveWranglerOptions(nitro, miniflareURL)),
  };
}

async function _resolveWranglerOptions(
  nitro: Nitro,
  miniflare: URL | undefined
): Promise<MiniflareRunnerDeps> {
  const { rootDir } = nitro.options;
  const inline = nitro.options.cloudflare?.wrangler;
  const configPath = await findNearestFile(["wrangler.json", "wrangler.jsonc", "wrangler.toml"], {
    startingFrom: rootDir,
  }).catch(() => undefined);
  const { supportedCompatibilityDate } = miniflare ? await import(miniflare.href) : {};
  return {
    // env-runner merges an inline config with the wrangler config of the cwd. Otherwise, use the
    // config nearest to `rootDir`, like the production build.
    wrangler: inline && Object.keys(inline).length > 0 ? { ...inline } : configPath || false,
    wranglerEnv: nitro.options.cloudflare?.wranglerEnv,
    miniflareOptions: {
      // The dev bundle imports Node.js built-ins that workerd only provides at recent dates
      compatibilityDate: supportedCompatibilityDate,
      defaultPersistRoot: resolve(rootDir, ".wrangler/state/v3"),
      // The dev worker is the only worker and exports `fetch` only: static assets are served by
      // Nitro, and bindings to other workers or to classes and handlers it does not export would
      // prevent it from starting.
      assets: undefined,
      serviceBindings: undefined,
      durableObjects: undefined,
      workflows: undefined,
      queueConsumers: undefined,
      tails: undefined,
      streamingTails: undefined,
    },
  };
}

function _resolve(id: string, dir: string): URL | undefined {
  const path = resolveModulePath(id, { from: [dir, import.meta.url], try: true });
  return path ? pathToFileURL(path) : undefined;
}
