import "#internal/nitro/virtual/polyfill";
// @ts-ignore
import functions from "firebase-functions/v2";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { useRuntimeConfig } from "#internal/nitro";

export const server = functions.https.onRequest(
  useRuntimeConfig()?.firebaseV2?.httpRequestOptions || {},
  toNodeListener(nitroApp.h3App)
);
