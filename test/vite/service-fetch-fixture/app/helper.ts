// A `fetch` helper shared with a lazy chunk gets re-exported from the entry chunk
// (`preserveEntrySignatures: "allow-extension"`), next to the real service handler.
export const fetch = (input: RequestInfo | URL, init?: RequestInit) =>
  globalThis.fetch(input, init);
