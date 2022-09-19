import depA from 'nitro-dep-a'
import depB from 'nitro-dep-b'
import depLib from 'nitro-lib'

export default defineEventHandler(() => {
  return {
    depA,
    depB,
    depLib
  }
})
