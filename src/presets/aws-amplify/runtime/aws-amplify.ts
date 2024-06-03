import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "nitropack/runtime/app";

import { Server } from "node:http";
import { toNodeListener } from "h3";

const server = new Server(toNodeListener(nitroApp.h3App));

// @ts-ignore
server.listen(3000, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Listening on http://localhost:3000 (AWS Amplify Hosting)`);
  }
});
