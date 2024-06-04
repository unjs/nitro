import { relative } from "pathe";

const RELATIVE_RE = /^\.{1,2}\//;

export function relativeWithDot(from: string, to: string) {
  const rel = relative(from, to);
  return RELATIVE_RE.test(rel) ? rel : "./" + rel;
}
