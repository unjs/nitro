// Resolves the `fetch` handler of a Vite service entry. Shared by the production wrapper
// (`build/vite/services.ts`) and the dev worker so both accept the same shapes.
//
// The default export wins over a named `fetch` export: server builds keep the entry signature
// (`preserveEntrySignatures`), so a `fetch` helper imported anywhere in the graph can end up
// re-exported from the entry chunk next to the real handler.
export function resolveServiceFetch(mod, { name, entry }) {
  const service = mod?.default ?? mod;
  if (typeof service?.fetch === "function") {
    return service.fetch.bind(service);
  }
  if (typeof service === "function") {
    return service;
  }
  if (service !== mod && typeof mod.fetch === "function") {
    return mod.fetch;
  }
  throw new TypeError(
    `[nitro] Service "${name}" (${entry}) does not export a \`fetch\` handler ` +
      "(expected `export default { fetch }`, `export default function` or `export function fetch`, " +
      `got ${describeExports(mod)}).`,
    { cause: { resolved: mod } }
  );
}

function describeExports(mod) {
  const service = mod?.default ?? mod;
  if (service === null || service === undefined) {
    return String(service);
  }
  if (typeof service !== "object" && typeof service !== "function") {
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
