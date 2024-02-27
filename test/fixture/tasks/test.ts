export default defineTask({
  meta: {
    description: "task to debug",
  },
  run(taskEvent) {
    console.log("test task", taskEvent);
    return { result: taskEvent };
  },
});
