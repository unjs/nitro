import { defineNitroPreset } from '../preset'

export const awsLambda = defineNitroPreset({
  entry: '#internal/nitro/entries/aws-lambda',
  externals: true
})
