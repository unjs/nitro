import { defineNitroPreset } from "../preset";

export const awsLambdaStreaming = defineNitroPreset({
  extends: "aws-lambda",
  entry: "#internal/nitro/entries/aws-lambda-streaming",
});
