import type { RouterMethod } from "h3";
import type { FetchRequest, FetchOptions, FetchResponse } from "ofetch";
import type { MatchedRoutes } from "./utils";

// An interface to extend in a local project
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InternalApi {}

export interface InternalFetch<
  DefaultResponse = unknown,
  DefaultFetchRequest extends string | Request | URL =
    | Exclude<FetchRequest, string>
    | URL,
> {
  <T = DefaultResponse, R extends string | Request | URL = DefaultFetchRequest>(
    url: unknown extends T
      ? R
      :
          | R
          // eslint-disable-next-line @typescript-eslint/ban-types
          | (string & {})
  ): Promise<T>;
}

export type NitroFetchRequest =
  | keyof InternalApi
  | Exclude<FetchRequest, string>
  | URL;

export type MiddlewareOf<
  Route extends string,
  Method extends RouterMethod | "default",
> = Method extends keyof InternalApi[MatchedRoutes<Route>]
  ? Exclude<InternalApi[MatchedRoutes<Route>][Method], Error | void>
  : never;

export type TypedInternalResponse<
  Route,
  Default = unknown,
  Method extends RouterMethod = RouterMethod,
> = Default extends string | boolean | number | null | void | object
  ? // Allow user overrides
    Default
  : Route extends string
  ? MiddlewareOf<Route, Method> extends never
    ? MiddlewareOf<Route, "default"> extends never
      ? // Bail if only types are Error or void (for example, from middleware)
        Default
      : MiddlewareOf<Route, "default">
    : MiddlewareOf<Route, Method>
  : Default;

// Extracts the available http methods based on the route.
// Defaults to all methods if there aren't any methods available or if there is a catch-all route.
export type AvailableRouterMethod<R extends NitroFetchRequest> =
  R extends string
    ? keyof InternalApi[MatchedRoutes<R>] extends undefined
      ? RouterMethod
      : Extract<
          keyof InternalApi[MatchedRoutes<R>],
          "default"
        > extends undefined
      ? Extract<RouterMethod, keyof InternalApi[MatchedRoutes<R>]>
      : RouterMethod
    : RouterMethod;

// Argumented fetch options to include the correct request methods.
// This overrides the default, which is only narrowed to a string.
export interface NitroFetchOptions<
  R extends NitroFetchRequest,
  M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>,
> extends FetchOptions {
  method?: Uppercase<M> | M;
}

// Extract the route method from options which might be undefined or without a method parameter.
export type ExtractedRouteMethod<
  R extends NitroFetchRequest,
  O extends NitroFetchOptions<R>,
> = O extends undefined
  ? "get"
  : Lowercase<O["method"]> extends RouterMethod
  ? Lowercase<O["method"]>
  : "get";

export interface $Fetch<
  DefaultResponse = unknown,
  DefaultFetchRequest extends string | Request | URL =
    | Exclude<FetchRequest, string>
    | URL,
> extends InternalFetch<DefaultResponse, DefaultFetchRequest> {
  raw: InternalFetch<DefaultResponse, DefaultFetchRequest>;
  create(defaults: FetchOptions): InternalFetch<DefaultResponse>;
}

declare global {
  // eslint-disable-next-line no-var
  var $fetch: $Fetch;
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      $fetch: $Fetch;
    }
  }
}

export {};
