import { emailTasks, scheduledEmailTasks } from "#internal/nitro/virtual/tasks";
import { createError } from "h3";

type MaybePromise<T> = T | Promise<T>;

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

/** @experimental */
export interface EmailPayload {
  [key: string]: unknown;
}

/** @experimental */
export interface EmailMeta {
  domain?: string;
  description?: string;
}

/** @experimental */
export interface EmailTaskEvent {
  domain: string;
  payload: EmailPayload;
  context: EmailContext;
}

/** @experimental */
export interface EmailTaskResult<RT = unknown> {
  result?: RT;
}

/** @experimental */
export interface EmailTask<RT = unknown> {
  meta: EmailMeta;
  run(event: EmailTaskEvent): MaybePromise<{ result?: RT }>;
}

/** @experimental */
export function defineEmailTask<RT = unknown>(
  def: EmailTask<RT>
): EmailTask<RT> {
  if (typeof def.run !== "function") {
    def.run = () => {
      throw new TypeError("Task must implement a `run` method!");
    };
  }
  return def;
}

const __runningEmailTasks__: {
  [name: string]: MaybePromise<EmailTaskResult<any>>;
} = {};

/** @experimental */
export async function runEmailTask<RT = unknown>(
  domain: string,
  {
    payload = {},
    context = {},
  }: { payload?: EmailPayload; context?: EmailContext } = {}
): Promise<EmailTaskResult<RT>> {
  if (__runningEmailTasks__[domain]) {
    return __runningEmailTasks__[domain];
  }

  if (!(domain in emailTasks)) {
    throw createError({
      message: `Task \`${domain}\` is not available!`,
      statusCode: 404,
    });
  }

  if (!emailTasks[domain].resolve) {
    throw createError({
      message: `Task \`${domain}\` is not implemented!`,
      statusCode: 501,
    });
  }

  const handler = (await emailTasks[domain].resolve!()) as EmailTask<RT>;
  const taskEvent: EmailTaskEvent = { domain, payload, context };
  __runningEmailTasks__[domain] = handler.run(taskEvent);

  try {
    const res = await __runningEmailTasks__[domain];
    return res;
  } finally {
    delete __runningEmailTasks__[domain];
  }
}

/** @experimental */
export function getEmailTasks(domain: string): string[] {
  return (
    (scheduledEmailTasks || []).find((task) => task.domain.endsWith(domain))
      ?.tasks || []
  );
}

export function runEmailTasks(
  domain: string,
  ctx: { payload?: EmailPayload; context?: EmailContext }
): Promise<EmailTaskResult[]> {
  return Promise.all(
    getEmailTasks(domain).map((name) => runEmailTask(name, ctx))
  );
}
