import { defineNitroPreset } from "nitropack/kit";
export type { AwsLambdaOptions as PresetOptions } from "./types";

const awsLambda = defineNitroPreset(
  {
    entry: "./runtime/aws-lambda",
  },
  {
    name: "aws-lambda" as const,
    url: import.meta.url,
  }
);

export default [awsLambda] as const;
