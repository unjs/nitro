import { defineNitroConfig } from "../../src/config";

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
  handlers: [
    {
      route: "/api/test/*/foo",
      handler: "~/api/hello.ts",
    },
  ],
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
    dynamic: "initial",
  },
  runtimeConfig: {
    dynamic: "initial",
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
    "/rules/headers": { headers: { "cache-control": "s-maxage=60" } },
    "/rules/cors": {
      cors: true,
      headers: { "access-control-allow-methods": "GET" },
    },
    "/rules/dynamic": { cache: false, isr: false },
    "/rules/redirect": { redirect: "/base" },
    "/rules/isr/**": { isr: true },
    "/rules/isr-ttl/**": { isr: 60 },
    "/rules/swr/**": { swr: true },
    "/rules/swr-ttl/**": { swr: 60 },
    "/rules/redirect/obj": {
      redirect: { to: "https://nitro.unjs.io/", statusCode: 308 },
    },
    "/rules/nested/**": { redirect: "/base", headers: { "x-test": "test" } },
    "/rules/nested/override": { redirect: { to: "/other" } },
    "/rules/_/noncached/cached": { swr: true },
    "/rules/_/noncached/**": { swr: false, cache: false, isr: false },
    "/rules/_/cached/noncached": { cache: false, swr: false, isr: false },
    "/rules/_/cached/**": { swr: true },
    "/api/proxy/**": { proxy: "/api/echo" },
  },
  prerender: {
    crawlLinks: true,
    ignore: [
      // '/api/param/'
    ],
    routes: ["/prerender", "/icon.png", "/404"],
  },
});
