import { defineRouteMeta } from "#internal/nitro";

export default defineEventHandler(() => "Test post handler");

defineRouteMeta({
    openAPI: {
        tags: [
            "Test"
        ],
        parameters: [
            {
                in: "query",
                name: 'test',
                required: true
            },
        ],
        responses: {
            200: {
                description: "OK"
            },
            404: {
                description: "Not found"
            },
        },
    },
});
