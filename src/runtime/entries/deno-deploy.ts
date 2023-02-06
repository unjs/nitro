import "#internal/nitro/virtual/polyfill";
// @ts-ignore
import { serve } from "https://deno.land/std/http/server.ts";
import { handler } from "./deno";

serve((request: Request) => {
  return handler(request);
});
