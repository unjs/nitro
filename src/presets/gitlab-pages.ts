import { defineNitroPreset } from "../preset";

export const gitlabPages = defineNitroPreset({
  extends: "static",
  prerender: {
    routes: [
      "/",
      // https://docs.gitlab.com/ee/user/project/pages/introduction.html#custom-error-codes-pages
      "/404.html",
    ],
  },
});
