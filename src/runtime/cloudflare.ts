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

export interface QueueRetryOptions {
  delaySeconds?: number;
}

export interface MessageBody<Body = unknown> {
  readonly id: string;
  readonly timestamp: Date;
  readonly body: Body;
  adk(): void;
  retry(options?: QueueRetryOptions): void;
}

export interface MessageBatch<Body = unknown> {
  readonly queue: string;
  readonly messages: MessageBody<Body>[];
  ackAll(): void;
  retryAll(options?: QueueRetryOptions): void;
}
