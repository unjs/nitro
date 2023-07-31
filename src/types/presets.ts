import type { HttpsOptions } from "firebase-functions/v2/https";
import type { RuntimeOptions, region } from "firebase-functions";

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

export interface PresetOptions {
  vercel: {
    config: VercelBuildConfigV3;
    /**
     * If you are using `vercel-edge`, you can specify the region(s) for your edge function.
     * @see https://vercel.com/docs/concepts/functions/edge-functions#edge-function-regions
     */
    regions?: string[];
    functions?: {
      memory: number;
      maxDuration: number;
      [key: string]: unknown;
    };
  };
  firebase?: FirebaseOptions;
}
