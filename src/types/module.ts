import type { Nitro } from "./nitro";

export interface NitroModule {
  setup?: (this: void, nitro: Nitro) => void | Promise<void>;
}
