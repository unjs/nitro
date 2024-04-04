defineRouteMeta({
  openAPI: {
    tags: ["Test"],
    description: "some test description (GET)",
  },
});

export default defineEventHandler(() => "Test get handler");
