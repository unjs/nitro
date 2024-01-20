import { defineOpenAPISchema } from "../../../src/runtime/routes/openapi";

export default defineEventHandler(() => "Test post handler");

defineOpenAPISchema({
    method: 'post',
    routeBase: '/api/test',
    schema: {
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
