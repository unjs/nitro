addEventListener("fetch", (event) => {
  console.log(event);
  return JSON.stringify({
    foo: "123",
  });
});
