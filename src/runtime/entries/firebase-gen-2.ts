import "#internal/nitro/virtual/polyfill";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { onRequest } from "firebase-functions/v2/https";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { useAppConfig } from "#internal/nitro";

const firebaseConfig = useAppConfig().nitro.firebase;

if (firebaseConfig.httpsOptions?.region) {
  setGlobalOptions({
    region: firebaseConfig.httpsOptions.region,
  });
}

export const __firebaseServerFunctionName__ = onRequest(
  {
    // Must be set to public to allow all public requests by default
    invoker: "public",
    ...firebaseConfig.httpOptions,
  },
  toNodeListener(nitroApp.h3App)
);
