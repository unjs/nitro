import type { NitroModule } from "./types";

export function defineNitroModule(def: NitroModule) {
  if (!def.setup) {
    def.setup = () => {};
  }
  return def;
}
