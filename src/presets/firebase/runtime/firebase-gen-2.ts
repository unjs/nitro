import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "#internal/nitro/app";
import { useAppConfig } from "#internal/nitro";

import { onRequest } from "firebase-functions/v2/https";
import { toNodeListener } from "h3";

const firebaseConfig = useAppConfig().nitro.firebase;

export const __firebaseServerFunctionName__ = onRequest(
  {
    // Must be set to public to allow all public requests by default
    invoker: "public",
    ...firebaseConfig.httpsOptions,
  },
  toNodeListener(nitroApp.h3App)
);
