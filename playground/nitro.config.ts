export default defineNitroConfig({
  vercel: {
    functions: {
      supportsResponseStreaming: true,
    },
  },
});
