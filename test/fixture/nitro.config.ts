import { defineNitroConfig } from "../../src";

export default defineNitroConfig({
  compressPublicAssets: true,
  imports: {
    presets: [
      {
        // TODO: move this to built-in preset
        from: "scule",
        imports: ["camelCase", "pascalCase", "kebabCase"],
      },
    ],
  },
  devProxy: {
    "/proxy/example": { target: "https://example.com", changeOrigin: true },
  },
  serverAssets: [
    {
      baseName: "files",
      dir: "files",
    },
  ],
  appConfig: {
    "nitro-config": true,
  },
  appConfigFiles: ["~/server.config.ts"],
  publicAssets: [
    {
      baseURL: "build",
      dir: "public/build",
      maxAge: 3600,
    },
  ],
  nodeModulesDirs: ["./_/node_modules"],
  routeRules: {
    "/api/param/prerender4": { prerender: true },
    "/api/param/prerender2": { prerender: false },
  },
  prerender: {
    crawlLinks: true,
    ignore: [
      // '/api/param/'
    ],
    routes: ["/prerender", "/icon.png", "/404"],
  },
});
