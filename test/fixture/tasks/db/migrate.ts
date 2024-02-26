export default defineTask({
  description: "Run database migrations",
  run() {
    console.log("Running DB migration task...");
    return { result: "Success" };
  },
});
