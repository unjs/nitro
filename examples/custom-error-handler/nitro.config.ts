import { defineNitroConfig } from "nitropack/config";
import errorHandler from "./error";

export default defineNitroConfig({
  errorHandler: "~/error",
  devErrorHandler: errorHandler,
});
