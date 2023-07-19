import { allErrors } from "../plugins/errors";

export default eventHandler((event) => {
  return {
    allErrors,
  };
});
