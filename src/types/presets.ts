import type { CloudflarePagesRoutes } from "../presets/cloudflare-pages";

/**
 * Vercel Build Output Configuration
 * @see https://vercel.com/docs/build-output-api/v3
 */
export interface VercelBuildConfigV3 {
  version: 3;
  routes?: (
    | {
        src: string;
        headers: {
          "cache-control": string;
        };
        continue: boolean;
      }
    | {
        handle: string;
      }
    | {
        src: string;
        dest: string;
      }
  )[];
  images?: {
    sizes: number[];
    domains: string[];
    remotePatterns?: {
      protocol?: "http" | "https";
      hostname: string;
      port?: string;
      pathname?: string;
    }[];
    minimumCacheTTL?: number;
    formats?: ("image/avif" | "image/webp")[];
    dangerouslyAllowSVG?: boolean;
    contentSecurityPolicy?: string;
  };
  wildcard?: Array<{
    domain: string;
    value: string;
  }>;
  overrides?: Record<
    string,
    {
      path?: string;
      contentType?: string;
    }
  >;
  cache?: string[];
  crons?: {
    path: string;
    schedule: string;
  }[];
}

/**
 * https://vercel.com/docs/build-output-api/v3/primitives#serverless-function-configuration
 */
export interface VercelServerlessFunctionConfig {
  /**
   * Amount of memory (RAM in MB) that will be allocated to the Serverless Function.
   */
  memory?: number;

  /**
   * Maximum execution duration (in seconds) that will be allowed for the Serverless Function.
   */
  maxDuration?: number;

  /**
   * True if a custom runtime has support for Lambda runtime wrappers.
   */
  supportsWrapper?: boolean;

  /**
   * When true, the Serverless Function will stream the response to the client.
   */
  supportsResponseStreaming?: boolean;

  [key: string]: unknown;
}

export interface PresetOptions {
  vercel: {
    config: VercelBuildConfigV3;

    /**
     * If you are using `vercel-edge`, you can specify the region(s) for your edge function.
     * @see https://vercel.com/docs/concepts/functions/edge-functions#edge-function-regions
     */
    regions?: string[];

    functions?: VercelServerlessFunctionConfig;
  };
  cloudflare: {
    pages: {
      /**
       * Nitro will automatically generate a `_routes.json` that controls which files get served statically and
       * which get served by the Worker. Using this config will override the automatic `_routes.json.
       * @see https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
       *
       * There are a maximum of 100 rules, and you must have at least one include rule. Wildcards are accepted.
       *
       * If any fields are unset, they default to:
       * ```json
       * {
       *   "version": 1,
       *   "include": ["/*"],
       *   "exclude": []
       * }
       * ```
       */
      routes?: Partial<CloudflarePagesRoutes>;
    };
  };
}
