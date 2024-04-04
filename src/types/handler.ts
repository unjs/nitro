import type { EventHandler, H3Event, H3Error } from "h3";
import { NitroOptions } from "./nitro";

type MaybeArray<T> = T | T[];

export interface NitroEventHandler {
  /**
   * Path prefix or route
   *
   * If an empty string used, will be used as a middleware
   */
  route?: string;

  /**
   * Specifies this is a middleware handler.
   * Middleware are called on every route and should normally return nothing to pass to the next handlers
   */
  middleware?: boolean;

  /**
   * Use lazy loading to import handler
   */
  lazy?: boolean;

  /**
   * Path to event handler
   *
   */
  handler: string;

  /**
   * Router method matcher
   */
  method?: string;

  /**
   * Environments to include this handler
   */
  env?: MaybeArray<
    // eslint-disable-next-line @typescript-eslint/ban-types
    "dev" | "prod" | "prerender" | NitroOptions["preset"] | (string & {})
  >;
}

export interface NitroDevEventHandler {
  /**
   * Path prefix or route
   */
  route?: string;

  /**
   * Event handler
   *
   */
  handler: EventHandler;
}

export type NitroErrorHandler = (
  error: H3Error,
  event: H3Event
) => void | Promise<void>;
