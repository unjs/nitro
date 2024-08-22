import type { Nitro } from "./nitro";

export type NitroModuleInput = string | NitroModule | NitroModule["setup"];

export type NitroModuleOptions = Record<string, any>;

export interface NitroModule<
  O extends NitroModuleOptions = NitroModuleOptions,
> {
  name?: string;
  configKey?: string;
  setup: (this: void, nitro: Nitro, options: O) => void | Promise<void>;
}
