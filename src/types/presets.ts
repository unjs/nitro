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

export interface PresetOptions {
  vercel: {
    config: VercelBuildConfigV3;
    functions?: {
      memory: number;
      maxDuration: number;
    };
  };
}
