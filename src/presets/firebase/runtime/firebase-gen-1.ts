import "#nitro-internal-pollyfills";
import functions from "firebase-functions";
import { toNodeHandler } from "h3";
import { useNitroApp, useRuntimeConfig } from "nitro/runtime";

const nitroApp = useNitroApp();

const firebaseConfig = useRuntimeConfig()._firebase;

export const __firebaseServerFunctionName__ = functions
  .region(firebaseConfig.region ?? functions.RESET_VALUE)
  .runWith(firebaseConfig.runtimeOptions ?? functions.RESET_VALUE)
  // @ts-expect-error TODO
  .https.onRequest(toNodeHandler(nitroApp.h3App));
