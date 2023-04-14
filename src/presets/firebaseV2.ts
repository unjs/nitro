import { defineNitroPreset } from "../preset";

export const firebaseV2 = defineNitroPreset({
  extends: "firebase",
  entry: "#internal/nitro/entries/firebaseV2",
});
