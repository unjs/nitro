import type { Database } from "db0";
import { createDatabase } from "db0";
import dbConnector from "db0/connectors/better-sqlite3";

let db: Database;

export function useDB(): Database {
  if (!db) {
    db = createDatabase(dbConnector({}));
  }
  return db;
}
