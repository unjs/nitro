export const exportConditions = (
  runtimeKeys: string | string[],
  conditions: string[]
) => {
  const keys = Array.isArray(runtimeKeys) ? runtimeKeys : [runtimeKeys];
  return [...keys, ...conditions.filter((c) => !new Set(keys).has(c))];
};

export const nodeExportConditions = [
  "default",
  "production",
  "module",
  "node",
  "import",
];

/**
 * Attempt to match generic non-node runtime first,
 * then try to match providers runtime keys,
 * then finally browser, deno and node.
 * https://runtime-keys.proposal.wintercg.org/
 */
export const workerExportConditions = [
  "wintercg",
  "worker",
  "web",
  "workerd",
  "edge-light",
  "lagon",
  "netlify",
  "edge-routine",
  "browser",
  "import",
  "module",
  "deno",
  "default",
  "production",
  "node",
];
