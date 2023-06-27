import type { Database } from "db0";
import { createDatabase } from "db0";
import { createConnection } from "#internal/nitro/virtual/database";

let db: Database;

export function useDatabase(): Database {
  if (!db) {
    db = createDatabase(createConnection());
  }
  return db;
}
