import { defineOpenAPISchema } from "../../../src/runtime/routes/openapi";

export default defineEventHandler(() => "Test get handler");

defineOpenAPISchema({
    routeBase: '/api/test',
    tags: ["Test"],
    method: 'get',
    summary: "some test",
    description: "some test description",
    deprecated: false,
})
