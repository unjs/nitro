import { defineNitroPreset } from "../preset";

export const heroku = defineNitroPreset({
  extends: "node-server",
});
