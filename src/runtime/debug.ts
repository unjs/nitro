import { createDebugger } from "hookable";
import { defineNitroPlugin } from "./plugin";

export default defineNitroPlugin((nitro) => {
  createDebugger(nitro.hooks, { tag: "nitro-runtime" });
});
