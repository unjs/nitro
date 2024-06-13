import type { NitroOptions } from "nitro/types";

export async function resolveOpenAPIOptions(options: NitroOptions) {
  if (options.dev && options.experimental.openAPI) {
    options.handlers.push({
      route: "/_nitro/openapi.json",
      handler: "nitro/runtime/internal/routes/openapi",
    });
    options.handlers.push({
      route: "/_nitro/scalar",
      handler: "nitro/runtime/internal/routes/scalar",
    });
    options.handlers.push({
      route: "/_nitro/swagger",
      handler: "nitro/runtime/internal/routes/swagger",
    });
  }
}
