// Client polyfill
import { $fetch } from "ofetch";
import { $Fetch, NitroFetchRequest } from "nitropack/types";

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch as $Fetch<unknown, NitroFetchRequest>;
}
