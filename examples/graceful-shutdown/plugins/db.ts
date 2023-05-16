export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hookOnce("close", async () => {
    console.log("Disconnecting database...");

    // something you want to do, such like disconnected the database, or wait the task is done
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("Database is disconnected!");
  });
});
