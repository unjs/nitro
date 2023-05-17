export default defineEventHandler(() => {
  return ["foo", new Date()] as [string, Date];
});
