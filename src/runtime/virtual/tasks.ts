import type { NitroTask } from "../task";

export const tasks: Record<
  string,
  { get: () => Promise<{ default: NitroTask }>; description?: string }
> = {};
