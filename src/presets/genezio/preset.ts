import { defineNitroPreset } from "nitropack/kit";
import type { Nitro } from "nitropack/types";
import { generateFunctionFiles } from "./utils";

const genezio = defineNitroPreset(
  {
    extends: "aws_lambda",
    hooks: {
      async compiled(nitro: Nitro) {
        await generateFunctionFiles(nitro);
      },
    },
  },
  {
    name: "genezio" as const,
    stdName: "genezio",
    url: import.meta.url,
  }
);
export default [genezio] as const;
