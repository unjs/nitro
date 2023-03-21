import { defineNitroPreset } from "../preset";

export const awsLambdaEdge = defineNitroPreset({
  entry: "#internal/nitro/entries/aws-lambda-edge",
});
