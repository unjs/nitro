import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "../app";

async function cli() {
  const url = process.argv[2] || "/";
  const debug = (label, ...args) => console.debug(`> ${label}:`, ...args);
  const r = await nitroApp.localCall({ url });

  debug("URL", url);
  debug("StatusCode", r.status);
  debug("StatusMessage", r.statusText);
  // @ts-ignore
  for (const header of r.headers.entries()) {
    debug(header[0], header[1]);
  }
  console.log("\n", r.body.toString());
}

// eslint-disable-next-line unicorn/prefer-module
if (require.main === module) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  cli().catch((err) => {
    console.error(err);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
}
