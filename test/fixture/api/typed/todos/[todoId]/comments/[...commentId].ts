export default eventHandler(() => ({
  internalApiKey: "/api/typed/todos/:todoId/comments/**:commentId" as const,
}));
