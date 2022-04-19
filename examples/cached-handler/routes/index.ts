export default defineCachedEventHandler(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return `Response generated at ${new Date().toISOString()} (took 1 second)`
})
