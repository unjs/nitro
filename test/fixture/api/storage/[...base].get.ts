export default eventHandler(async (event) => {
  const { key } = getQuery(event)
  const base = event.context.params.base as string
  const storage = useStorage(`cache:${base}`)
  if (!key) {
    return await storage.getKeys()
  }

  const value = await storage.getItem(key as string)
  return { key, value }
})
