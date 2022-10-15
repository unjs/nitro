// @ts-ignore
import depA from 'nitro-dep-a'
// @ts-ignore
import depB from 'nitro-dep-b'
// @ts-ignore
import depLib from 'nitro-lib'
// @ts-ignore
import subpathLib from 'nitro-lib/subpath'

export default defineEventHandler(() => {
  return {
    depA,
    depB,
    depLib,
    subpathLib
  }
})
