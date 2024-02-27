import { createError } from "h3";
import { tasks } from "#internal/nitro/virtual/tasks";

type MaybePromise<T> = T | Promise<T>;

/** @experimental */
export interface TaskContext {}

/** @experimental */
export interface TaskPayload {
  [key: string]: unknown;
}

/** @experimental */
export interface TaskMeta {
  name?: string;
  description?: string;
}

/** @experimental */
export interface TaskEvent {
  name: string;
  payload: TaskPayload;
  context: TaskContext;
}

export interface TaskResult<RT = unknown> {
  result?: RT;
}

/** @experimental */
export interface Task<RT = unknown> {
  meta?: TaskMeta;
  run(event: TaskEvent): MaybePromise<{ result?: RT }>;
}

/** @experimental */
export function defineTask<RT = unknown>(def: Task<RT>): Task<RT> {
  if (typeof def.run !== "function") {
    def.run = () => {
      throw new TypeError("Task must implement a `run` method!");
    };
  }
  return def;
}

const __runningTasks__: { [name: string]: MaybePromise<TaskResult<any>> } = {};

/** @experimental */
export async function runTask<RT = unknown>(
  name: string,
  {
    payload = {},
    context = {},
  }: { payload?: TaskPayload; context?: TaskContext } = {}
): Promise<TaskResult<RT>> {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }

  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404,
    });
  }

  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501,
    });
  }

  const handler = (await tasks[name].resolve()) as Task<RT>;
  const taskEvent: TaskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);

  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}
