export default eventHandler((event) => {
  return {
    url: event.node.req.url,
    method: event.node.req.method,
    headers: event.node.req.headers,
  };
});
