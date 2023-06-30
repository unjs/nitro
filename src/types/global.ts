import type { NitroOptions } from "./nitro";

export interface NitroStaticBuildFlags {
  dev?: boolean;
  client?: boolean;
  nitro?: boolean;
  prerender?: boolean;
  preset?: NitroOptions["preset"];
  server?: boolean;
  versions?: {
    nitro?: string;
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process extends NitroStaticBuildFlags {}
  }

  interface ImportMeta extends NitroStaticBuildFlags {}
}

export {};
