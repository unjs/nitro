import { runtimeDir } from "nitropack/runtime/meta";
import type { NitroOptions } from "nitropack/types";
import { join } from "pathe";

export async function resolveOpenAPIOptions(options: NitroOptions) {
  if (options.dev && options.experimental.openAPI) {
    options.handlers.push({
      route: "/_nitro/openapi.json",
      handler: join(runtimeDir, "internal/routes/openapi"),
    });
    options.handlers.push({
      route: "/_nitro/scalar",
      handler: join(runtimeDir, "internal/routes/scalar"),
    });
    options.handlers.push({
      route: "/_nitro/swagger",
      handler: join(runtimeDir, "internal/routes/swagger"),
    });
  }
}
