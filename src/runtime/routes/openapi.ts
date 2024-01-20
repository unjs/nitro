import { eventHandler } from "h3";
import type {
  OpenAPI3,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
} from "openapi-typescript";
import { NitroOpenapiSchema } from "../../types";
import { handlersMeta } from "#internal/nitro/virtual/server-handlers";
import { useRuntimeConfig, useStorage } from "#internal/nitro";

 
// Served as /_nitro/openapi.json
export default eventHandler( async () => {
  const base = useRuntimeConfig()?.app?.baseURL;
  const paths = getPaths()

  for (const path in paths) {
    const methods = Object.keys(paths[path]);
    for (const method of methods) {
      const hasItem = await useStorage(path).hasItem(`openapi-${method}`)
      if (hasItem) {
        const storage = await useStorage(path).getItem(`openapi-${method}`)
        if (typeof storage === 'object') {
          paths[path][method] = {
            ...paths[path][method],
            ...storage
          }
        }
      }
    }
  }
  return <OpenAPI3>{
    openapi: "3.0.0",
    info: {
      title: "Nitro Server Routes",
      version: null,
    },
    servers: [
      {
        url: `http://localhost:3000${base}`,
        description: "Local Development Server",
        variables: {},
      },
    ],
    schemes: ["http"],
    paths: paths,
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
      parameters.push({ name, in: "path", required: true });
    }
  }

  return {
    route,
    parameters,
  };
}

function defaultTags(route: string) {
  const tags: string[] = [];
  const defaultTagAPI = "API Routes"

  if (route.startsWith("/api/")) {
    tags.push(defaultTagAPI);
  } else if (route.startsWith("/_")) {
    tags.push("Internal");
  } else {
    tags.push("App Routes");
  }

  return tags;
}


export function defineOpenAPISchema(schema: NitroOpenapiSchema) {
  useStorage(schema.routeBase).setItem(`openapi-${schema.method}`, schema);
  return schema
}