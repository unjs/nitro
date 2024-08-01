import type { Task, TaskMeta } from "nitropack/types";

export const tasks: Record<
  string,
  { resolve?: () => Promise<Task>; meta: TaskMeta }
> = {};

export const scheduledTasks: false | { cron: string; tasks: string[]; once: boolean; }[] = [];
