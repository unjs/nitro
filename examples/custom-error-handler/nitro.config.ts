import errorHandler from "./error";

export default defineNitroConfig({
  errorHandler: "~/error",
  devErrorHandler: errorHandler,
});
