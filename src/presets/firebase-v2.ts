import type { HttpsOptions } from "firebase-functions/lib/v2/providers/https";
import { defu } from "defu";
import { defineNitroPreset } from "../preset";

export const firebaseV2 = defineNitroPreset({
  extends: "firebase",
  entry: "#internal/nitro/entries/firebase-v2",
  hooks: {
    "rollup:before": (nitro) => {
      // apply default options
      const defaultHttpRequestOptions: HttpsOptions = {
        // set invoker to public to allow for all public requests by default
        invoker: "public",
      };

      // merge the default options with the user provided options
      const httpRequestOptions = defu(
        nitro.options.firebase?.v2?.httpRequestOptions || {},
        defaultHttpRequestOptions
      );

      // inject these options in to the app config for use in the firebase entry
      nitro.options.appConfig._firebaseV2HttpRequestOptions =
        httpRequestOptions;
    },
  },
});
