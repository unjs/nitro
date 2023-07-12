import "#internal/nitro/virtual/polyfill";
import { onRequest } from "firebase-functions/v2/https";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { useAppConfig } from "#internal/nitro";

export const server = onRequest(
  useAppConfig()?._firebaseV2HttpRequestOptions || {},
  toNodeListener(nitroApp.h3App)
);
