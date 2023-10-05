import { Nitro } from "./nitro";

export type ModuleOptions = Record<string, unknown>;
export interface ModuleSetupReturn {}

export interface ModuleDefinition<T extends ModuleOptions = ModuleOptions> {
  setup?: (this: void, resolvedOptions: T, nitro: Nitro) => Promise<ModuleSetupReturn | void> | ModuleSetupReturn | void;
}

export interface NitroModule<T extends ModuleOptions = ModuleOptions> {
  (this: void, inlineOptions: T, nitro: Nitro): Promise<ModuleSetupReturn | void> | ModuleSetupReturn | void;
}
