export default eventHandler(() => {
  const appConfig = useAppConfig();

  return {
    appConfig,
  };
});
