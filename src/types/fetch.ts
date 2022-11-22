import type { RouterMethod } from 'h3'
import type { FetchRequest, FetchOptions, FetchResponse } from 'ofetch'
import type { MatchedRoutes } from './utils'

// An interface to extend in a local project
export interface InternalApi { }

export type NitroFetchRequest = Exclude<keyof InternalApi, `/_${string}`|`/api/_${string}`> | Exclude<FetchRequest, string> | string & {}

export type MiddlewareOf<Route extends string, Method extends RouterMethod | 'default'> = Method extends keyof InternalApi[MatchedRoutes<Route>] ? Exclude<InternalApi[MatchedRoutes<Route>][Method], Error | void> : never

export type TypedInternalResponse<Route, Default = unknown, Method extends RouterMethod = 'get'> =
  Default extends string | boolean | number | null | void | object
    // Allow user overrides
    ? Default
    : Route extends string
      ? MiddlewareOf<Route, Method> extends never
        ? MiddlewareOf<Route, 'default'> extends never
          // Bail if only types are Error or void (for example, from middleware)
          ? Default
          : MiddlewareOf<Route, 'default'>
        : MiddlewareOf<Route, Method>
      : Default

export interface $Fetch<DefaultT = unknown, DefaultR extends NitroFetchRequest = NitroFetchRequest> {
  <M extends RouterMethod, T = DefaultT, R extends NitroFetchRequest = DefaultR> (request: R, opts?: {method?: M}): Promise<TypedInternalResponse<R, T, M>>
  raw<M extends RouterMethod, T = DefaultT, R extends NitroFetchRequest = DefaultR> (request: R, opts?: {method?: M}): Promise<FetchResponse<TypedInternalResponse<R, T, M>>>
  create<T = DefaultT, R extends NitroFetchRequest = DefaultR> (defaults: FetchOptions): $Fetch<T, R>
}

declare global {
  // eslint-disable-next-line no-var
  var $fetch: $Fetch
  namespace NodeJS {
    interface Global {
      $fetch: $Fetch
    }
  }
}

export { }
