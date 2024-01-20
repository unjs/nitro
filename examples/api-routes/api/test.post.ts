import { defineOpenAPISchema } from "../../../src/runtime/routes/openapi";

export default defineEventHandler(() => "Test post handler");

defineOpenAPISchema({
    tags: [
        "Test"
    ],
    method: 'post',
    routeBase: '/api/test',
    parameters: [
        {
            in: "query",
            name: 'test',
            required: true
        }
    ],
    responses: {
        "200": {
            description: "OK"
        },
        "404": {
            description: "Not found"
        }
    }
})
