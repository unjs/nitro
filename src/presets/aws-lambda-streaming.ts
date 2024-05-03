import { defineNitroPreset } from "../preset";

export const awsLambdaStreaming = defineNitroPreset({
  entry: "#internal/nitro/entries/aws-lambda-streaming",
});
