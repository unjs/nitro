import "#nitro/virtual/polyfills";
import { toNodeHandler } from "srvx/node";
import { useNitroApp } from "nitro/app";
import { withServerEntryOptions } from "#nitro/runtime/serve";

export default toNodeHandler(withServerEntryOptions(useNitroApp().fetch));
