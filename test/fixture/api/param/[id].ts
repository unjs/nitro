export default defineEventHandler((event) => {
  return event.context.params.id as number
})
