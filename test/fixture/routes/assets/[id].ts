export default eventHandler(async (event) => {
  const serverAssets = useStorage("assets/server");
  const id = event.context.params.id;

  if (!(await serverAssets.hasItem(id))) {
    throw createError({ message: `Asset ${id} not found`, statusCode: 404 });
  }

  const meta = (await serverAssets.getMeta(
    event.context.params.id
  )) as unknown as { type: string; etag: string; mtime: string };
  meta.type && setResponseHeader(event, "content-type", meta.type);
  meta.etag && setResponseHeader(event, "etag", meta.etag);
  meta.mtime && setResponseHeader(event, "last-modified", meta.mtime);

  return serverAssets.getItemRaw(event.context.params.id);
});
