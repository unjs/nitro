import { useStorage } from "#internal/nitro"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const filename = query?.filename || "index.html"
  const serverAsset = await useStorage().getItem(`assets/files/${filename}`)
  return serverAsset
})
