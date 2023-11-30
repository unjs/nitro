import { createError } from "h3";
import { useNitroApp, type NitroApp } from "./app";
import { tasks } from "#internal/nitro/virtual/tasks";

/** @experimental */
export interface NitroTaskContext {}

/** @experimental */
export interface NitroTaskPayload {
  [key: string]: unknown;
}

/** @experimental */
export interface NitroTaskMeta {
  name?: string;
  description?: string;
}

/** @experimental */
export interface NitroTask<RT = unknown> extends NitroTaskMeta {
  run(
    payload: NitroTaskPayload,
    context: NitroTaskContext
  ): { result: RT | Promise<RT> };
}

/** @experimental */
export function defineNitroTask<RT = unknown>(
  def: NitroTask<RT>
): NitroTask<RT> {
  if (typeof def.run !== "function") {
    def.run = () => {
      throw new TypeError("Nitro task must implement a `run` method!");
    };
  }
  return def;
}

/** @experimental */
export async function runNitroTask<RT = unknown>(
  name: string,
  payload: NitroTaskPayload = {}
): Promise<{ result: RT }> {
  if (!(name in tasks)) {
    throw createError(`Nitro task \`${name}\` not found!`);
  }
  const context: NitroTaskContext = {};
  const handler = await tasks[name].get().then((mod) => mod.default);
  const { result } = handler.run(payload, context);
  return {
    result: result as RT,
  };
}
