export default eventHandler(() => ({
  internalApiKey: '/api/todos/:todoId/comments/**:commentId' as const
}))
