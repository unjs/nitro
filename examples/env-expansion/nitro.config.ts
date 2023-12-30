export default defineNitroConfig({
    runtimeConfig: {
        nitro: {
            envExpansion: true,
        },
        mail: {
            host: "{{MAIL_HOST}}"
        }
    }
});
