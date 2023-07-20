export default eventHandler((event) => {
  const buff = base64ToArray(LOGO_BASE64);
  event.res.end(buff);
});
