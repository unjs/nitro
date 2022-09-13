// https://vercel.com/docs/build-output-api/v3
export interface VercelBuildConfigV3 {
    version: 3;
    routes?: (
      | {
          src: string;
          headers: {
            'cache-control': string;
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
      minimumCacheTTL?: number;
      formats?: ('image/avif' | 'image/webp')[];
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
}
