import { fileURLToPath } from 'url'

export default eventHandler(() => {
  return {
    testFile: fileURLToPath(new URL('./test.txt', import.meta.url)),
    // @ts-ignore
    hasEnv: typeof import.meta.env === 'object'
  }
})
