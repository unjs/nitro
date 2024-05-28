import { createError } from "h3";
import { Cron } from "croner";
import { isTest } from "std-env";
import { tasks, scheduledTasks } from "#internal/nitro/virtual/tasks";

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

/** @experimental */
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

  const handler = (await tasks[name].resolve!()) as Task<RT>;
  const taskEvent: TaskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);

  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

/** @experimental */
export function startScheduleRunner() {
  if (!scheduledTasks || scheduledTasks.length === 0 || isTest) {
    return;
  }

  const payload: TaskPayload = {
    scheduledTime: Date.now(),
  };

  for (const schedule of scheduledTasks) {
    const cron = new Cron(schedule.cron, async () => {
      await Promise.all(
        schedule.tasks.map((name) =>
          runTask(name, {
            payload,
            context: {},
          }).catch((error) => {
            console.error(
              `[nitro] Error while running scheduled task "${name}"`,
              error
            );
          })
        )
      );
    });
  }
}

/** @experimental */
export function getCronTasks(cron: string): string[] {
  return (scheduledTasks || []).find((task) => task.cron === cron)?.tasks || [];
}

/** @experimental */
export function runCronTasks(
  cron: string,
  ctx: { payload?: TaskPayload; context?: TaskContext }
): Promise<TaskResult[]> {
  return Promise.all(getCronTasks(cron).map((name) => runTask(name, ctx)));
}
