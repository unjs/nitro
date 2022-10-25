export default eventHandler((event) => {
  return event.context.params.id as number
})
