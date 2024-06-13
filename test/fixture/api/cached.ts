export default defineCachedEventHandler((event) => {
  return {
    timestamp: Date.now(),
    cache: event.context.cache,
  };
});
