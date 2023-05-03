export default eventHandler((event) => {
  console.log(event.node.req.headers)
  return "<h1>Hello Nitro!</h1>" + event.node.req.headers.host;
});
