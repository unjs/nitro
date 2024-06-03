import type { NitroOptions } from "nitropack/types";

export async function resolveOpenAPIOptions(options: NitroOptions) {
  if (options.dev && options.experimental.openAPI) {
    options.handlers.push({
      route: "/_nitro/openapi.json",
      handler: "nitropack/runtime/routes/openapi",
    });
    options.handlers.push({
      route: "/_nitro/scalar",
      handler: "nitropack/runtime/routes/scalar",
    });
    options.handlers.push({
      route: "/_nitro/swagger",
      handler: "nitropack/runtime/routes/swagger",
    });
  }
}
