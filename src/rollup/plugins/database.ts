import { connectors } from "db0";
import type { Nitro } from "../../types";
import { virtual } from "./virtual";

export function database(nitro: Nitro) {
  const dbConfigs =
    (nitro.options.dev && nitro.options.devDatabase) || nitro.options.database;

  const connectorsNames = [
    ...new Set(
      Object.values(dbConfigs || {}).map((config) => config?.connector)
    ),
  ].filter(Boolean);

  for (const name of connectorsNames) {
    if (!connectors[name]) {
      throw new Error(`Database connector "${name}" is invalid.`);
    }
  }

  return virtual(
    {
      "#internal/nitro/virtual/database": () => {
        return `
${connectorsNames.map((name) => `import ${name}Connector from "${connectors[name]}";`).join("\n")}

export const connectionConfigs = {
  ${Object.entries(dbConfigs || {})
    .map(
      ([name, { connector, options }]) =>
        `${name}: {
          connector: ${connector}Connector,
          options: ${JSON.stringify(options)}
        }`
    )
    .join(",\n")}
};
        `;
      },
    },
    nitro.vfs
  );
}
