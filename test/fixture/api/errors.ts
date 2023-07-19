import { allErrors } from "../plugins/errors";

export default eventHandler((event) => {
  return {
    allErrors: allErrors.map((entry) => ({
      message: entry.error.message,
    })),
  };
});
