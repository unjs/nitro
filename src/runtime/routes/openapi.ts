import { eventHandler } from "h3";
import type {
  OpenAPI3,
  PathItemObject,
  OperationObject,
  ParameterObject,
} from "openapi-typescript";
import { handlersMeta } from "#internal/nitro/virtual/server-handlers";

// Served as /_nitro/openapi.json
export default eventHandler((event) => {
  return <OpenAPI3>{
    openapi: "3.0.0",
    info: {
      title: "Nitro Server Routes",
      version: null,
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
        variables: {},
      },
    ],
    schemes: ["http"],
    paths: {
      ...Object.fromEntries(
        handlersMeta.map((h) => {
          const parameters: ParameterObject[] = [];

          let anonymouseCtr = 0;
          const route = h.route
            .replace(/:(\w+)/g, (_, name) => `{${name}}`)
            .replace(/\/(\*)\//g, () => `/{param${++anonymouseCtr}}/`)
            .replace(/\*\*{/, "{")
            .replace(/\/(\*\*)$/g, () => `/{*param${++anonymouseCtr}}`);

          const paramMatches = route.matchAll(/{(\*?\w+)}/g);
          for (const match of paramMatches) {
            const name = match[1];
            if (!parameters.some((p) => p.name === name)) {
              parameters.push({ name, in: "path", required: true });
            }
          }

          const tags: string[] = [];
          if (route.startsWith("/api/")) {
            tags.push("API Routes");
          } else if (route.startsWith("/_")) {
            tags.push("Internal");
          } else {
            tags.push("App Routes");
          }

          const item: PathItemObject = {
            [(h.method || "get").toLowerCase()]: <OperationObject>{
              tags,
              parameters,
              responses: {
                200: { description: "OK" },
              },
            },
          };
          return [route, item];
        })
      ),
    },
  };
});
