defineRouteMeta({
  openAPI: {
    tags: ["Test"],
    description: "some test description (POST)",
    parameters: [
      {
        in: "query",
        name: "test",
        required: true,
      },
    ],
    responses: {
      200: {
        description: "OK",
      },
      404: {
        description: "Not found",
      },
    },
  },
});

export default defineEventHandler(() => "Test post handler");
