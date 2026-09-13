// Resolves the handlers of a Vite service entry. Shared by the production wrapper (`lazyService`)
// and the dev worker so both accept the same shapes: `export default { fetch }` wins over a named
// `fetch` export.
export function resolveServiceFetch(mod, { name, entry }) {
  const fetch = resolveServiceExport(mod, "fetch");
  if (fetch) {
    return fetch;
  }
  throw new TypeError(
    `[nitro] Service "${name}" (${entry}) does not export a \`fetch\` handler ` +
      "(expected `export default { fetch }` or `export function fetch`, " +
      `got ${describeExports(mod)}).`,
    { cause: { resolved: mod } }
  );
}

// Resolves an exported method (`default` export first, then the module namespace). The property is
// read on every call so `this` stays bound to the object it belongs to and a handler replaced
// after load (a framework recompiling its `fetch`, a reassigned `export let`) is picked up.
export function resolveServiceExport(mod, key) {
  const service = mod?.default ?? mod;
  if (typeof service?.[key] === "function") {
    return (...args) => service[key](...args);
  }
  if (service !== mod && typeof mod[key] === "function") {
    return (...args) => mod[key](...args);
  }
}

// Production service wrapper: loads the entry on first use and keeps the resolved handler. A
// rejected load is not kept so the next request retries it (a module whose `fetch` shows up later
// recovers; a module whose evaluation failed keeps rejecting, as runtimes cache that).
export function lazyService(loader, { name, entry }) {
  let promise, handler;
  return {
    fetch(req) {
      if (handler) {
        return handler(req);
      }
      promise ??= loader()
        .then((mod) => (handler = resolveServiceFetch(mod, { name, entry })))
        .catch((error) => {
          promise = undefined;
          throw error;
        });
      return promise.then((handler) => handler(req));
    },
  };
}

function describeExports(mod) {
  const service = mod?.default ?? mod;
  if (service === null || service === undefined) {
    return String(service);
  }
  if (typeof service !== "object") {
    return typeof service;
  }
  if ("fetch" in service) {
    return `\`fetch\` of type ${typeof service.fetch}`;
  }
  const ctor = service.constructor?.name;
  const label = ctor && ctor !== "Object" ? `${ctor} instance` : "object";
  const keys = Object.keys(service);
  if (keys.length === 0) {
    return `empty ${label}`;
  }
  return `${label} with keys [${keys.slice(0, 10).join(", ")}${keys.length > 10 ? ", ..." : ""}]`;
}
