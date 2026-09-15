import { defineHandler } from "nitro";
import { useNitroApp } from "nitro/app";

export default defineHandler(async () => {
  const res = await useNitroApp().fetch(new Request("http://localhost/srvx-middleware"));
  return { body: await res.text(), plugin: res.headers.get("x-srvx-plugin") };
});
