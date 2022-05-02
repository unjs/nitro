import { eventHandler } from 'h3'

export default eventHandler(async () => {
  const keys = await useStorage().getKeys()
  return {
    keys
  }
})
