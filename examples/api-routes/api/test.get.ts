import { defineOpenAPISchema } from "../../../src/runtime/routes/openapi";

export default defineEventHandler(() => "Test get handler");

export const schema = defineOpenAPISchema({
    routeBase: '/api/test',
    tags: ["Test"],
    methods: {
        get: {
            summary: "some test",
            description: "some test description",
            deprecated: false,
        }
    }
})
