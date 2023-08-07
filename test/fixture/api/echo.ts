export default eventHandler((event) => {
  return {
    url: event.path,
    method: event.method,
    headers: Object.fromEntries(event.headers.entries()),
  };
});
