process.env.NITRO_DYNAMIC = "from-env";

export default eventHandler((event) => {
  console.log(">>", event.path);
  const appConfig = useAppConfig(event);
  appConfig.dynamic = "from-middleware";
});
