export default eventHandler(async (event) => {
  const { key, value } = await readBody(event)
  const base = event.context.params.base as string
  const storage = useStorage(`cache:${base}`)

  await storage.setItem(key, value)

  return { key, value }
})
