export default defineEventHandler((event) => {
  setHeader(event, "x-foo", "bar");
  setHeader(event, "x-array", ["foo", "bar"]);

  setHeader(event, "Set-Cookie", "foo=bar, bar=baz");
  setCookie(event, "test", "value");
  setCookie(event, "test2", "value");

  return "headers sent";
});
