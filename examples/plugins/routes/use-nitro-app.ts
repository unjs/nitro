import { eventHandler } from "h3";

export default eventHandler(() => ({
  nitroApp: !!useNitroApp()
}));
