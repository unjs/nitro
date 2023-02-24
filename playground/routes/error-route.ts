export default defineCachedEventHandler(
  () => {
    console.log("Error route hit!");
    throw new Error("Example Error!");
  },
  {
    maxAge: 5,
  }
);
