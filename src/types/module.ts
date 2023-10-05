import { Nitro } from "./nitro";

export type ModuleOptions = Record<string, unknown>;

export interface ModuleSetupReturn {}

export type Awaitable<T> = T | Promise<T>;
export interface ModuleDefinition<T extends ModuleOptions = ModuleOptions> {
  setup?: (
    this: void,
    nitro: Nitro,
    options: T
  ) => Awaitable<ModuleSetupReturn | void>;
}

export interface NitroModule {
  (this: void, nitro: Nitro): Awaitable<ModuleSetupReturn | void>;
}
