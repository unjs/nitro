const sharedAppConfig = useAppConfig();
const sharedRuntimeConfig = useRuntimeConfig();

export default eventHandler((event) => {
  const appConfig = useAppConfig(event);
  const runtimeConfig = useRuntimeConfig(event);

  return {
    sharedAppConfig,
    appConfig,
    runtimeConfig,
    sharedRuntimeConfig,
  };
});
