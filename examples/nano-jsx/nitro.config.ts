export default defineNitroConfig({
  esbuild: {
    options: {
      loaders: {
        '.tsx': 'tsx'
      },
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    },
  },
  handlers: [
    {
      handler: './app.tsx',
      route: '/**',
    },
  ],
});
