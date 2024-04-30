// TODO: for testing; delete before merging
export default eventHandler({
  handler: async (event) => {
    const foo = await $fetch('/foo', {
      method: 'post',
      // @ts-expect-error should require the num property
      body: {}
    });
    return foo;
  }
});