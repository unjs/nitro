export default defineNitroConfig({
    experimental: {
        openAPI: true,
    },
    runtimeConfig: {
        app: {
            oapischemas: [],
        }
    }
});
