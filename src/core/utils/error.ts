export function formatRollupError(_error: RollupError | OnResolveResult) {
  try {
    const logs: string[] = [_error.toString()];
    const errors = (_error as any)?.errors || [_error as RollupError];
    for (const error of errors) {
      const id = (error as any).path || error.id || (_error as RollupError).id;
      let path = isAbsolute(id) ? relative(process.cwd(), id) : id;
      const location =
        (error as RollupError).loc || (error as PartialMessage).location;
      if (location) {
        path += `:${location.line}:${location.column}`;
      }
      const text =
        (error as PartialMessage).text || (error as RollupError).frame;
      logs.push(
        `Rollup error while processing \`${path}\`` + text ? "\n\n" + text : ""
      );
    }
    return logs.join("\n");
  } catch {
    return _error?.toString();
  }
}
