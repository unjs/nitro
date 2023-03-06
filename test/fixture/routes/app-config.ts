import { appConfig } from "#internal/nitro/virtual/app-config";

export default eventHandler(() => {
  return {
    appConfig,
  };
});
