export default defineEventHandler(() => {
  return { foo: new Map<string, number>([["key", 2]]) };
});
