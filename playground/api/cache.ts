import { cachifyHandle } from '#cache'

const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default cachifyHandle(async () => {
  await waitFor(2000)
  return 'Response generated after 2 seconds at ' + new Date()
}, { swr: true })
