import type { NitroModule, NitroModuleInput } from "./types";

export function defineNitroModule(def: NitroModule) {
  return def;
}

export async function resolveNitroModule(
  mod: NitroModuleInput
): Promise<NitroModule> {
  if (typeof mod === "string") {
    // @ts-ignore
    globalThis.defineNitroModule =
      // @ts-ignore
      globalThis.defineNitroModule || defineNitroModule;
    mod = (await import(mod).then((m) => m.default)) as NitroModule;
  }

  if (typeof mod === "function") {
    mod = { setup: mod };
  }

  if (!mod.setup) {
    // TODO: Warn?
    mod.setup = () => {};
  }

  return mod;
}
