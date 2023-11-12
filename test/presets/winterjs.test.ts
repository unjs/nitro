import { describe } from "vitest";
import { execa, execaCommandSync } from "execa";
import { waitForPort, getRandomPort } from "get-port-please";
import { setupTest, testNitro } from "../tests";

const hasWasmer =
  execaCommandSync("wasmer --version", { stdio: "ignore", reject: false })
    .exitCode === 0;

describe.runIf(hasWasmer)("nitro:preset:winterjs", async () => {
  const ctx = await setupTest("winterjs");
  testNitro(ctx, async () => {
    const port = await getRandomPort();
    const p = execa(
      "wasmer",
      [
        "run",
        "wasmer/winterjs",
        "--forward-host-env",
        "--net",
        "--mapdir",
        "app:" + ctx.outDir,
        "app/server/index.mjs",
      ],
      {
        stdio: "inherit",
        env: {
          // ...ctx.env,
          RUST_BACKTRACE: "full",
          LISTEN_IP: "127.0.0.1",
          PORT: String(port),
        },
      }
    );
    ctx.server = {
      url: `http://127.0.0.1:${port}`,
      close: () => p.kill(),
    } as any;
    await waitForPort(port, { delay: 1000, retries: 20, host: "127.0.0.1" });
    return async ({ url, ...opts }) => {
      const res = await ctx.fetch(url, opts);
      return res;
    };
  });
});
