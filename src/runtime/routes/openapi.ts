import { eventHandler, getRequestURL } from "h3";
import type {
  OpenAPI3,
  PathItemObject,
  OperationObject,
  ParameterObject,
  PathsObject,
} from "openapi-typescript";
import { joinURL } from "ufo";
import { handlersMeta } from "#internal/nitro/virtual/server-handlers";
import { useRuntimeConfig } from "#internal/nitro";

// Served as /_nitro/openapi.json
export default eventHandler((event) => {
  const base = useRuntimeConfig()?.app?.baseURL;

  const url = joinURL(getRequestURL(event).origin, base);

  return <OpenAPI3>{
    openapi: "3.0.0",
    info: {
      title: "Nitro Server Routes",
      version: null,
    },
    servers: [
      {
        url,
        description: "Local Development Server",
        variables: {},
      },
    ],
    schemes: ["http"],
    paths: getPaths(),
  };
});

function getPaths(): PathsObject {
  const paths: PathsObject = {};

  for (const h of handlersMeta) {
    const { route, parameters } = normalizeRoute(h.route);
    const tags = defaultTags(h.route);
    const method = (h.method || "get").toLowerCase();

    const item: PathItemObject = {
      [method]: <OperationObject>{
        tags,
        parameters,
        responses: {
          200: { description: "OK" },
        },
      },
    };

    if (paths[route] === undefined) {
      paths[route] = item;
    } else {
      Object.assign(paths[route], item);
    }
  }

  return paths;
}

function normalizeRoute(_route: string) {
  const parameters: ParameterObject[] = [];

  let anonymousCtr = 0;
  const route = _route
    .replace(/:(\w+)/g, (_, name) => `{${name}}`)
    .replace(/\/(\*)\//g, () => `/{param${++anonymousCtr}}/`)
    .replace(/\*\*{/, "{")
    .replace(/\/(\*\*)$/g, () => `/{*param${++anonymousCtr}}`);

  const paramMatches = route.matchAll(/{(\*?\w+)}/g);
  for (const match of paramMatches) {
    const name = match[1];
    if (!parameters.some((p) => p.name === name)) {
      parameters.push({
        name,
        in: "path",
        required: true,
        schema: { type: "string" },
      });
    }
  }

  return {
    route,
    parameters,
  };
}

function defaultTags(route: string) {
  const tags: string[] = [];

  if (route.startsWith("/api/")) {
    tags.push("API Routes");
  } else if (route.startsWith("/_")) {
    tags.push("Internal");
  } else {
    tags.push("App Routes");
  }

  return tags;
}
