export default defineEventHandler(async () => {
  const db = useDatabase();

  // Create users table
  await db.sql`DROP TABLE IF EXISTS users`;
  await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

  // Add a new user
  const userId = String(Math.round(Math.random() * 10_000));
  await db.sql`INSERT INTO users VALUES (${userId}, 'John', 'Doe', '')`;

  // Query for users
  const { rows } = await db.sql`SELECT * FROM users WHERE id = ${userId}`;

  return `
    <h1>Database Example</h1>
    <a href="/_nitro/tasks/db:migrate">db:migrate (dev only)</a>
    <br>
    <h2>Rows:</h2>
    <pre>${JSON.stringify(rows, null, 2)}</pre>
    `;
});
