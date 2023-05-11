import os from "node:os";
import cluster from "node:cluster";

if (cluster.isPrimary) {
  let isShuttingDown = false;
  const numberOfWorkers =
    Number.parseInt(process.env.NITRO_CLUSTER_WORKERS) ||
    (os.cpus().length > 0 ? os.cpus().length : 1);
  for (let i = 0; i < numberOfWorkers; i++) {
    cluster.fork();
  }
  cluster.on("exit", () => {
    if (isShuttingDown) {
      return;
    }
    cluster.fork();
  });

  // graceful shutdown
  if (process.env.NITRO_SHUTDOWN === "true") {
    function shutdownWorkers() {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          for (const worker of Object.values(cluster.workers)) {
            // some workers is not dead
            if (!worker.isDead()) {
              return;
            }
          }

          // all workers are dead
          clearInterval(interval);
          return resolve(true);
        }, 3 * 1000);
      });
    }

    const terminationSignals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
    const signals = process.env.NITRO_SHUTDOWN_SIGNALS
      ? (process.env.NITRO_SHUTDOWN_SIGNALS.split(" ").map((str) =>
          str.trim()
        ) as NodeJS.Signals[])
      : terminationSignals;
    const forceExit = process.env.NITRO_SHUTDOWN_FORCE !== "false";

    async function onShutdown() {
      isShuttingDown = true;
      await shutdownWorkers();
      if (forceExit) {
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
      }
    }

    for (const signal of signals) {
      process.once(signal, onShutdown);
    }
  }
} else {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  import("./node-server").catch((error) => {
    console.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
}
