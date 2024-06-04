import { defineNitroPreset } from "nitropack/kit";

const awsLambda = defineNitroPreset(
  {
    entry: "./runtime/aws-lambda",
  },
  {
    name: "aws-lambda" as const,
    url: import.meta.url,
  }
);

const awsLambdaStreaming = defineNitroPreset(
  {
    extends: "aws-lambda",
    entry: "./runtime/aws-lambda-streaming",
  },
  {
    name: "aws-lambda-streaming" as const,
    url: import.meta.url,
  }
);

export default [awsLambda, awsLambdaStreaming] as const;
