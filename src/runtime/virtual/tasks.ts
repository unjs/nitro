import type { Task, TaskMeta } from "../task";

export const tasks: Record<
  string,
  { resolve?: () => Promise<Task>; meta: TaskMeta }
> = {};
