export default eventHandler(async (event) => {
  const serverAssets = useStorage('assets/server');
  const id = event.context.params.id
  const meta = await serverAssets.getMeta(event.context.params.id) as unknown as { type: string, etag: string, mtime: string }
  if (!meta) {
    throw createError(`Asset ${id} not found`)
  }
  setResponseHeader(event, 'content-type', meta.type)
  setResponseHeader(event, 'etag', meta.etag)
  setResponseHeader(event, 'last-modified', meta.mtime)
  return serverAssets.getItemRaw(event.context.params.id);
})
