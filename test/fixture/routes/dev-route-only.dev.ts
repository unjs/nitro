const sharedAppConfig = useAppConfig();
const sharedRuntimeConfig = useRuntimeConfig();

export default eventHandler(() => "You should only see this in dev mode.");
