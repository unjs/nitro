export default eventHandler<{ query: { id: string } }, string>(() => 'foo');
