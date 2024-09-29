import errorHandler from "./error";

export default defineNitroConfig({
  compatibilityDate: "2024-09-29",
  errorHandler: "~/error",
  devErrorHandler: errorHandler,
});
