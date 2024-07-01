import "#nitro-internal-pollyfills";
import functions from "firebase-functions";
import { toNodeListener } from "h3";
import { useNitroApp, useRuntimeConfig } from "nitro/runtime";

const nitroApp = useNitroApp();

const firebaseConfig = useRuntimeConfig()._firebase;

export const __firebaseServerFunctionName__ = functions
  .region(firebaseConfig.region ?? functions.RESET_VALUE)
  .runWith(firebaseConfig.runtimeOptions ?? functions.RESET_VALUE)
  .https.onRequest(toNodeListener(nitroApp.h3App));
