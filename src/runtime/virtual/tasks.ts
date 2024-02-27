import type { Task, TaskMeta } from "../task";

export const tasks: Record<
  string,
  { resolve?: () => Promise<Task>; meta: TaskMeta }
> = {};

export const scheduledTasks: false | { cron: string; tasks: string[] }[] = [];
