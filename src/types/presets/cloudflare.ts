/**
 * https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
 */
export interface CloudflarePagesRoutes {
  /** Defines the version of the schema. Currently there is only one version of the schema (version 1), however, we may add more in the future and aim to be backwards compatible. */
  version?: 1;

  /** Defines routes that will be invoked by Functions. Accepts wildcard behavior. */
  include?: string[];

  /** Defines routes that will not be invoked by Functions. Accepts wildcard behavior. `exclude` always take priority over `include`. */
  exclude?: string[];
}

export interface CloudflareOptions {
  pages: {
    /**
     * Nitro will automatically generate a `_routes.json` that controls which files get served statically and
     * which get served by the Worker. Using this config will override the automatic `_routes.json`. Or, if the
     * `merge` options is set, it will merge the user-set routes with the auto-generated ones, giving priority
     * to the user routes.
     *
     * @see https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
     *
     * There are a maximum of 100 rules, and you must have at least one include rule. Wildcards are accepted.
     *
     * If any fields are unset, they default to:
     *
     * ```json
     * {
     *   "version": 1,
     *   "include": ["/*"],
     *   "exclude": []
     * }
     * ```
     */
    routes?: CloudflarePagesRoutes;
    /**
     * If set to `false`, nitro will disable the automatically generated `_routes.json` and instead use the user-set only ones.
     *
     * @default true
     */
    defaultRoutes?: boolean;
  };
}
