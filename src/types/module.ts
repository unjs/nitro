import { Nitro } from "./nitro";

export interface ModuleSetupReturn {}

export type Awaitable<T> = T | Promise<T>;
export interface ModuleDefinition {
  setup?: (
    this: void,
    nitro: Nitro,
  ) => Awaitable<ModuleSetupReturn | void>;
}

export interface NitroModule {
  (this: void, nitro: Nitro): Awaitable<ModuleSetupReturn | void>;
}
