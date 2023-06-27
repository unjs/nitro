import type { Nitro } from "../../types";
import { virtual } from "./virtual";

export function database(nitro: Nitro) {
  const dbConfig =
    (nitro.options.dev && nitro.options.devDatabase) || nitro.options.database;

  return virtual(
    {
      "#internal/nitro/virtual/database": () => {
        if (!dbConfig) {
          return `export const createConnection = () => {
            throw new Error('[nitro] No database connection configured!')
          }`;
        }
        const { connector, options } = dbConfig;
        return `
        import dbConnector from 'db0/connectors/${connector}'

        export const createConnection = () => dbConnector(${
          (JSON.stringify(options), null, 2)
        })
        `;
      },
    },
    nitro.vfs
  );
}
