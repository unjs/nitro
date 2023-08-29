import { resolve } from "pathe";
import { describe, it, expect } from "vitest";
import { execa, execaCommandSync } from "execa";
import { getRandomPort, waitForPort } from "get-port-please";
import { setupTest, testNitro } from "../tests";

const hasDeno =
  execaCommandSync("deno --version", { stdio: "ignore", reject: false })
    .exitCode === 0;

describe.runIf(hasDeno)("nitro:preset:deno-server", async () => {
  const ctx = await setupTest("deno-server");
  testNitro(ctx, async () => {
    const port = await getRandomPort();
    const p = execa(
      "deno",
      ["task", "--config", resolve(ctx.outDir, "deno.json"), "start"],
      {
        stdio: "inherit",
        env: {
          PORT: String(port),
        },
      }
    );
    ctx.server = {
      url: `http://127.0.0.1:${port}`,
      close: () => p.kill(),
    } as any;
    await waitForPort(port, { delay: 1000, retries: 20 });
    return async ({ url, ...opts }) => {
      const res = await ctx.fetch(url, opts);
      return res;
    };
  });
});
