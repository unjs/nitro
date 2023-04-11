export type BindParameters = unknown[] | Record<string, unknown>;

export default defineEventHandler(async (event) => {
  const db = await useSQliteDB();

  await db.exec(
    "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT, email TEXT)"
  );

  const id = String(Math.round(Math.random() * 10000));

  await db.prepare("INSERT INTO users VALUES (?, 'John', 'Doe', '')").run(id);

  const row = await db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  return {
    row,
  };
});
