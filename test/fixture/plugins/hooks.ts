import { defineNitroPlugin } from "../../../src/runtime/plugin";

export default defineNitroPlugin((app) => {
  app.hooks.hook("cloudflare:scheduled", (event) => {
    console.log("SCHEDULED", event, event.scheduledTime, event.cron);
    event.waitUntil(Promise.resolve(0));
    event.waitUntil(Promise.resolve(event.scheduledTime));
    event.waitUntil(Promise.resolve(event.cron));
    event.waitUntil(Promise.resolve("scheduled:cloudflare"));
  });

  app.hooks.hook(
    "cloudflare-module:scheduled",
    ({ controller, env, context }) => {
      console.log(
        "SCHEDULED:M",
        controller,
        controller.scheduledTime,
        controller.cron
      );
      context.waitUntil(Promise.resolve(0));
      context.waitUntil(Promise.resolve(controller.scheduledTime));
      context.waitUntil(Promise.resolve(controller.cron));
      context.sendResponse = () => "scheduled:cloudflare-module";
    }
  );

  app.hooks.hook("cloudflare:queue", (event) => {});

  app.hooks.hook("cloudflare-module:queue", ({ batch, env, context }) => {
    context.sendResponse = () => "queued:cloudflare-module";
  });
});
