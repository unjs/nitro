// @ts-ignore
import { serverQueryContent } from '#content/server'

export default eventHandler(async (event) => {
  return await serverQueryContent(event).where({ _type: 'markdown', navigation: { $ne: false } }).find()
})
