//
/**
 * load balancer, receives all requests
 */

import { defineNitroPreset } from '../preset'

export const stormkit = defineNitroPreset({
  entry: '#nitro/entries/stormkit',
  externals: true,
  output: {
    dir: '{{ rootDir }}/.stormkit'
  }
})
