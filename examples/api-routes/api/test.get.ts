import { defineRouteMeta } from "#internal/nitro";

export default defineEventHandler(() => "Test get handler");

// defineRouteMeta({
//     openAPI: {
//         tags: ["Test"],
//         summary: "some test",
//         description: "some test description",
//         deprecated: false,
//     },
//     name: 'Something'
// })

defineRouteMeta({
    openAPI: {
        tags: ["Test"],
        summary: "some test",
        description: "some test description",
        deprecated: false,
    },
    name: 'Something'
})