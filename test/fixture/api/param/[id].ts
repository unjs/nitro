export default eventHandler((event) => {
  return Number(event.context.params.id);
});
