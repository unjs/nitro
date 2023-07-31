import "#internal/nitro/virtual/polyfill";
import functions from "firebase-functions";
import { toNodeListener } from "h3";
import { nitroApp } from "../app";
import { useAppConfig } from "#internal/nitro";

const firebaseGen1Config = useAppConfig()?._firebase;

export const server = functions
  .region(firebaseGen1Config?.region ?? functions.RESET_VALUE)
  .runWith(firebaseGen1Config?.runtimeOptions ?? functions.RESET_VALUE)
  .https.onRequest(toNodeListener(nitroApp.h3App));
