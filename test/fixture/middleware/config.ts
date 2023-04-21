process.env.NITRO_DYNAMIC = "from-env";

export default eventHandler((event) => {
  const appConfig = useAppConfig(event);
  appConfig.dynamic = "from-middleware";
});
