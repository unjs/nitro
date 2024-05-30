import type { NitroOptions } from "nitropack/types";

export async function resolveOpenAPIOptions(options: NitroOptions) {
  if (options.dev && options.experimental.openAPI) {
    options.handlers.push({
      route: "/_nitro/openapi.json",
      handler: "#internal/nitro/routes/openapi",
    });
    options.handlers.push({
      route: "/_nitro/scalar",
      handler: "#internal/nitro/routes/scalar",
    });
    options.handlers.push({
      route: "/_nitro/swagger",
      handler: "#internal/nitro/routes/swagger",
    });
  }
}
