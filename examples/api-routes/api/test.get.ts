import { defineOpenAPISchema } from "../../../src/runtime/routes/openapi";

export default defineEventHandler(() => "Test get handler");

defineOpenAPISchema({
    routeBase: '/api/test',
    method: 'get',
    schema: {
        tags: ["Test"],
        summary: "some test",
        description: "some test description",
        deprecated: false,
    },
});
