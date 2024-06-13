import "#nitro-internal-pollyfills";
import { useRuntimeConfig, useNitroApp } from "nitro/runtime";
import functions from "firebase-functions";
import { toNodeListener } from "h3";

const nitroApp = useNitroApp();

const firebaseConfig = useRuntimeConfig()._firebase;

export const __firebaseServerFunctionName__ = functions
  .region(firebaseConfig.region ?? functions.RESET_VALUE)
  .runWith(firebaseConfig.runtimeOptions ?? functions.RESET_VALUE)
  .https.onRequest(toNodeListener(nitroApp.h3App));
