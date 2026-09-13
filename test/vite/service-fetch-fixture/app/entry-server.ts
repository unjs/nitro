import { fetch } from "./helper.ts";

export default {
  prefix: "rendered:",
  async fetch(req: Request) {
    const { render } = await import("./lazy.ts");
    return new Response(this.prefix + render(req.url) + ":" + typeof fetch);
  },
};
