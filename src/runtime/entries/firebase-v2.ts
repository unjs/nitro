import "#internal/nitro/virtual/polyfill";
import functions from "firebase-functions/v2";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { useAppConfig } from "#internal/nitro";

export const server = functions.https.onRequest(
  useAppConfig()?._firebaseV2HttpRequestOptions || {},
  toNodeListener(nitroApp.h3App)
);
