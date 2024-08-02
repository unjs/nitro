export default defineTask({
  meta: {
    name: "test",
    description: "Test",
  },
  run({ payload, context }) {
    console.log("Test task", payload, context);
    console.log(Date.now());
    return { result: "Success" };
  },
});
