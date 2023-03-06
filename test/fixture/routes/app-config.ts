import { useAppConfig } from "#imports";

export default eventHandler(() => {
  const appConfig = useAppConfig();

  return {
    appConfig,
  };
});
