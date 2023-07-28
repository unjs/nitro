import "#internal/nitro/virtual/polyfill";
import { onRequest } from "firebase-functions/v2/https";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { useAppConfig } from "#internal/nitro";

export const server = onRequest(
  {
    // must be set to public to allow all public requests by default
    invoker: "public",
    ...useAppConfig()?._firebase?.gen2?.httpOptions,
  },
  toNodeListener(nitroApp.h3App)
);
