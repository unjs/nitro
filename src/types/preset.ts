import type { ProviderName } from "std-env";
import type { NitroConfig } from "./config";
import type { DateString } from "compatx";

export type NitroPreset = NitroConfig | (() => NitroConfig);

export interface NitroPresetMeta {
  url: string;
  name: string;
  stdName?: ProviderName;
  aliases?: string[];
  static?: boolean;
  compatibilityDate?: DateString;
}
