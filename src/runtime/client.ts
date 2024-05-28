// Client polyfill
import { $fetch } from "ofetch";
import { $Fetch, NitroFetchRequest } from "nitropack/schema";

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch as $Fetch<unknown, NitroFetchRequest>;
}
