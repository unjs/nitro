import { defineNitroPreset } from '../preset'

export const awsLambda = defineNitroPreset({
  entry: '#nitro/entries/aws-lambda',
  externals: true
})
