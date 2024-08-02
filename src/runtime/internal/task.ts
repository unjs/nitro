import { Cron } from "croner";
import { createError } from "h3";
import type { Task, TaskContext, TaskEvent, TaskPayload, TaskResult, TaskOptions } from "nitropack/types";
import { isTest } from "std-env";
import { scheduledTasks, tasks } from "#nitro-internal-virtual/tasks";

/** @experimental */
export function defineTask<RT = unknown>(def: Task<RT>): Task<RT> {
  if (typeof def.run !== "function") {
    def.run = () => {
      throw new TypeError("Task must implement a `run` method!");
    };
  }
  return def;
}

const __runningTasks__: { [name: string]: ReturnType<Task<any>["run"]> } = {};

/** @experimental */
export async function runTask<RT = unknown>(
  name: string,
  {
    payload = {},
    context = {},
  }: { payload?: TaskPayload; context?: TaskContext } = {},
  opts: TaskOptions = {}
): Promise<TaskResult<RT>> {
  if (opts.runAt || opts.runAfter) {
    if (opts.runAt && opts.runAfter) {
      throw createError({
        message: "Cannot use both `runAt` and `runAfter` options!",
        statusCode: 400,
      });
    }

    let date: Date;
    if (opts.runAt) {
      date = typeof opts.runAt === "string" ? new Date(opts.runAt) : opts.runAt;
    } else if (opts.runAfter) {
      date = new Date(Date.now() + opts.runAfter * 1000);
    } else {
      throw new Error("Invalid options!");
    }

    const cron = `${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
    scheduleTask(name, cron);
    return {};
  }

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
    return await __runningTasks__[name];
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
    new Cron(schedule.cron, async () => {
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
      )
    });
  }
}

/** @experimental */
export function scheduleTask(name: string, cron: string) {
  if (!scheduledTasks) {
    throw new Error("Scheduled tasks are not available!");
  }

  scheduledTasks.push({ cron, tasks: [name], once: true });

  const payload: TaskPayload = {
    scheduledTime: Date.now(),
  };

  new Cron(cron, {
    maxRuns: 1,
  }, async () => {
    await runTask(name, {
      payload,
      context: {},
    }).catch((error) => {
      console.error(`[nitro] Error while running scheduled task "${name}"`, error);
    });

    if (scheduledTasks) {
      const index = scheduledTasks.findIndex((task) => task.cron === cron);
      if (index >= 0) {
        scheduledTasks.splice(index, 1);
      }
    }
  });
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
