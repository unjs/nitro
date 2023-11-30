import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "pathe";
import { ofetch } from "ofetch";
import type { NitroTaskPayload } from "./runtime";
import { NitroBuildInfo } from "nitropack";

interface TaskRunnerOptions {
  cwd?: string;
  buildDir?: string;
}

export async function runNitroTask(
  name: string,
  payload?: NitroTaskPayload,
  opts?: TaskRunnerOptions
): Promise<{ result: unknown }> {
  const ctx = await getTasksContext(opts);
  const result = await ctx.devFetch("/_nitro/tasks/" + name);
  return result;
}

export async function listNitroTasks(opts?: TaskRunnerOptions) {
  const ctx = await getTasksContext(opts);
  const res = (await ctx.devFetch("/_nitro/tasks")) as {
    tasks: Record<string, { description: string }>;
  };
  return res.tasks;
}

const devHint = `(is dev server running?)`;

/** @experimental */
async function getTasksContext(opts: TaskRunnerOptions) {
  const cwd = resolve(process.cwd(), opts.cwd);
  const outDir = resolve(cwd, opts.buildDir || ".nitro");

  const buildInfoPath = resolve(outDir, "nitro.json");
  if (!existsSync(buildInfoPath)) {
    throw new Error(`Missing info file: \`${buildInfoPath}\` ${devHint}`);
  }

  const buildInfo = JSON.parse(
    await readFile(buildInfoPath, "utf8")
  ) as NitroBuildInfo;

  if (!buildInfo.dev?.pid || !buildInfo.dev?.workerAddress) {
    throw new Error(
      `Missing dev server info in: \`${buildInfoPath}\` ${devHint}`
    );
  }

  if (!pidIsRunning(buildInfo.dev.pid)) {
    throw new Error(`Dev server is not running (pid: ${buildInfo.dev.pid})`);
  }

  const devFetch = ofetch.create({
    baseURL: `http://${buildInfo.dev.workerAddress.host || "localhost"}:${
      buildInfo.dev.workerAddress.port || "3000"
    }`,
    // @ts-expect-error
    socketPath: buildInfo.dev.workerAddress.socketPath,
  });

  return {
    buildInfo,
    devFetch,
  };
}

function pidIsRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
