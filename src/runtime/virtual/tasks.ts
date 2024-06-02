import type { Task, TaskMeta } from "../task";
import { EmailMeta, EmailTask } from "#internal/nitro/emailtask";

export const tasks: Record<
  string,
  { resolve?: () => Promise<Task>; meta: TaskMeta }
> = {};

export const scheduledTasks: false | { cron: string; tasks: string[] }[] = [];

export const emailTasks: Record<
  string,
  { resolve?: () => Promise<EmailTask>; meta: EmailMeta }
> = {};

export const scheduledEmailTasks:
  | false
  | { domain: string; tasks: string[] }[] = [];
