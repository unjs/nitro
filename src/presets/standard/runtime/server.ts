import "#nitro/virtual/polyfills";
import { useNitroApp } from "nitro/app";
import { withServerEntryOptions } from "#nitro/runtime/serve";

export default {
  fetch: withServerEntryOptions(useNitroApp().fetch),
};
