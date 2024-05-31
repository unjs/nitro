process.env.NITRO_DYNAMIC = "from-env";

export default eventHandler((event) => {
  if (event.path.startsWith("/config")) {
    const appConfig = useAppConfig(event);
    appConfig.dynamic = "from-middleware";
  }
});
