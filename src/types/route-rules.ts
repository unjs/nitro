import type { ProxyOptions, RouterMethod } from "h3";
import type { ExcludeFunctions, IntRange } from "./_utils";
import type { CachedEventHandlerOptions } from "./runtime";

export type HTTPStatusCode = IntRange<100, 600>;

export interface NitroRouteConfig {
  cache?: ExcludeFunctions<CachedEventHandlerOptions> | false;
  headers?: Record<string, string>;
  redirect?: string | { to: string; statusCode?: HTTPStatusCode };
  prerender?: boolean;
  proxy?: string | ({ to: string } & ProxyOptions);
  isr?: number | boolean;

  // Shortcuts
  cors?: boolean;
  swr?: boolean | number;
  static?: boolean | number;
}

export interface NitroRouteRules
  extends Omit<NitroRouteConfig, "redirect" | "cors" | "swr" | "static"> {
  redirect?: { to: string; statusCode: HTTPStatusCode };
  proxy?: { to: string } & ProxyOptions;
}
