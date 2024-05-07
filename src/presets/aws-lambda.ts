import { defineNitroPreset } from "../preset";

export const awsLambda = defineNitroPreset({
  entry: "#internal/nitro/entries/aws-lambda",
});

export const awsLambdaStreaming = defineNitroPreset({
  extends: "aws-lambda",
  entry: "#internal/nitro/entries/aws-lambda-streaming",
});
