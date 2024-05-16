import consola from "consola";
import { colorize } from "consola/utils";
import { existsSync } from "node:fs";
import fsp from "node:fs/promises";
import { relative, dirname, resolve } from "pathe";
import { fileURLToPath } from "node:url";

export function prettyPath(p: string, highlight = true) {
  p = relative(process.cwd(), p);
  return highlight ? colorize("cyan", p) : p;
}

export function resolveFrom(from: URL | string, to: string) {
  return fileURLToPath(new URL(to, from));
}

export async function writeFile(
  file: string,
  contents: Buffer | string,
  log = false
) {
  await fsp.mkdir(dirname(file), { recursive: true });
  await fsp.writeFile(
    file,
    contents,
    typeof contents === "string" ? "utf8" : undefined
  );
  if (log) {
    consola.info("Generated", prettyPath(file));
  }
}

export function resolveFile(
  path: string,
  base = ".",
  extensions = [".js", ".ts", ".mjs", ".cjs", ".json"]
): string | undefined {
  path = resolve(base, path);
  if (existsSync(path)) {
    return path;
  }
  for (const ext of extensions) {
    const p = path + ext;
    if (existsSync(p)) {
      return p;
    }
  }
}
