export interface AzureOptions {
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
