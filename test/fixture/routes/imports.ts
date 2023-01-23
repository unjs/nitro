import { testUtil } from "#imports";

export default defineEventHandler(() => {
  return {
    testUtil: testUtil(),
  };
});
