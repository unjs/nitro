/** @experimental */
export interface EmailContext {
  readonly from?: string;
  readonly to?: string;
  readonly headers?: Headers;
  readonly raw?: ReadableStream;
  readonly rawSize?: number;

  setReject?(reason: string): void;
  forward?(rcptTo: string, headers?: Headers): Promise<void>;
  reply?(message: EmailContext): Promise<void>;
}
