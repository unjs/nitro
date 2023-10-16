// eslint-disable-next-line require-await
export default eventHandler(async (event) => {
  const config = useRuntimeConfig()
  return config;
});
