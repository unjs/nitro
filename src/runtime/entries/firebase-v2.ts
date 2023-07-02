import "#internal/nitro/virtual/polyfill";
import functions from "firebase-functions/v2";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { useRuntimeConfig } from "#internal/nitro";

export const server = functions.https.onRequest(
  useRuntimeConfig()?.firebase?.httpRequestOptions || {},
  toNodeListener(nitroApp.h3App)
);
