export default eventHandler(async (event) => {
  const kvStorage = useStorage("data");
  const counter = (Number(await kvStorage.getItem("counter")) || 0) + 1;
  await kvStorage.setItem("counter", counter);
  return {
    counter,
  };
});
