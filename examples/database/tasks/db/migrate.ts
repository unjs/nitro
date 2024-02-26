export default defineNitroTask({
  description: "Run database migrations",
  async run(payload, context) {
    const db = useDatabase();

    console.log("Running database migrations...", { payload, context });

    // Create users table
    await db.sql`DROP TABLE IF EXISTS users`;
    await db.sql`CREATE TABLE IF NOT EXISTS users ("id" TEXT PRIMARY KEY, "firstName" TEXT, "lastName" TEXT, "email" TEXT)`;

    return {
      result: "Database migrations complete!",
    };
  },
});
