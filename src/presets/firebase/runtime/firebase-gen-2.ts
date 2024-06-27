import "#nitro-internal-pollyfills";
import { useNitroApp, useRuntimeConfig } from "nitro/runtime";

import { onRequest } from "firebase-functions/v2/https";
import { toNodeHandler } from "h3";

const nitroApp = useNitroApp();

const firebaseConfig = useRuntimeConfig()._firebase;

export const __firebaseServerFunctionName__ = onRequest(
  {
    // Must be set to public to allow all public requests by default
    invoker: "public",
    ...firebaseConfig.httpsOptions,
  },
  // @ts-expect-error TODO
  toNodeHandler(nitroApp.h3App)
);
