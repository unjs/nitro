import type { SSTConfig } from "sst";
import type { HttpsOptions } from "firebase-functions/v2/https";
import type { RuntimeOptions, region } from "firebase-functions";
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

interface FirebaseOptionsBase {
  gen: 1 | 2;
  /**
   * Firebase functions node runtime version.
   * @see https://cloud.google.com/functions/docs/concepts/nodejs-runtime
   */
  nodeVersion?: "20" | "18" | "16";
  /**
   * When deploying multiple apps within the same Firebase project
   * you must give your server a unique name in order to avoid overwriting your functions.
   *
   * @default "server"
   */
  serverFunctionName?: string;
}

interface FirebaseOptionsGen1 extends FirebaseOptionsBase {
  gen: 1;
  /**
   * Firebase functions 1st generation region passed to `functions.region()`.
   */
  region?: Parameters<typeof region>[0];
  /**
   * Firebase functions 1st generation runtime options passed to `functions.runWith()`.
   */
  runtimeOptions?: RuntimeOptions;
}

interface FirebaseOptionsGen2 extends FirebaseOptionsBase {
  gen: 2;
  /**
   * Firebase functions 2nd generation https options passed to `onRequest`.
   * @see https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.https.httpsoptions
   */
  httpsOptions?: HttpsOptions;
}

type FirebaseOptions = FirebaseOptionsGen1 | FirebaseOptionsGen2;

interface AWSLambdaOptionsBase {
  target: "single" | "edge";
  sst?: boolean;
  sstOptions?: Awaited<ReturnType<SSTConfig["config"]>>;
}

interface AwsLambdaOptionsSingleRegion extends AWSLambdaOptionsBase {
  target: "single";
}

interface AwsLambdaOptionsEdge extends AWSLambdaOptionsBase {
  target: "edge";
  cdk?: boolean;
}

type AWSLambdaOptions = AwsLambdaOptionsSingleRegion | AwsLambdaOptionsEdge;
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

interface AzureOptions {
  config?: {
    platform?: {
      apiRuntime?: string;
      [key: string]: unknown;
    };
    navigationFallback?: {
      rewrite?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
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
  firebase: FirebaseOptions;
  awsLambda: AWSLambdaOptions;
  cloudflare: {
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
  };
  azure: AzureOptions;
}
