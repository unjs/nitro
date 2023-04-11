export interface Statement {
  bind(...params: unknown[]): this;
  all(...params: unknown[]): Promise<unknown[]>;
  run(...params: unknown[]): Promise<{ success: boolean }>;
  get(...params: unknown[]): Promise<unknown>;
}

export async function useSQliteDB(name?: string) {
  return process.env.NODE_ENV === "development"
    ? _useNodeSQlite(name)
    : _useCFD1(name);
}

// https://developers.cloudflare.com/d1/platform/client-api
async function _useCFD1(name: string = "NITRO_DB") {
  const db = globalThis.__cf_env__[name];
  return {
    exec: (sql: string) => db.exec(sql),
    prepare: (sql: string) => {
      const _stmt = db.prepare(sql);
      const onError = (err) => {
        if (err.cause) {
          err.message = err.cause.message + ' "' + sql + '"';
        }
        throw err;
      };
      const stmt = <Statement>{
        bind(...params) {
          _stmt.bind(...params);
          return stmt;
        },
        all(...params) {
          return _stmt
            .bind(...params)
            .all()
            .catch(onError);
        },
        run(...params) {
          return _stmt
            .bind(...params)
            .run()
            .then((res) => {
              return { success: res.success };
            })
            .catch(onError);
        },
        get(...params) {
          return _stmt
            .bind(...params)
            .first()
            .catch(onError);
        },
      };
      return stmt;
    },
  };
}

// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
async function _useNodeSQlite(name: string = "db") {
  const Database = await import("better-sqlite3").then((m) => m.default);
  const db = new Database(`./${name}.sqlite3`);

  return {
    exec: (sql: string) => db.exec(sql),
    prepare: (sql: string) => {
      const _stmt = db.prepare(sql);
      const stmt = <Statement>{
        bind(...params) {
          if (params.length) {
            _stmt.bind(...params);
          }
          return stmt;
        },
        all(...params) {
          return Promise.resolve(_stmt.all(...params));
        },
        run(...params) {
          const res = _stmt.run(...params);
          return Promise.resolve({ success: res.changes > 0 });
        },
        get(...params) {
          return Promise.resolve(_stmt.get(...params));
        },
      };
      return stmt;
    },
  };
}
