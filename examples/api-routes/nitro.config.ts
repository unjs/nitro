export default defineNitroConfig({
    experimental: {
        openAPI: true,
    },
    runtimeConfig: {
        app: {
            openapi: {
                schemas: []
            }
        }
    }
});
