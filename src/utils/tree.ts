import { promises as fsp } from "node:fs";
import { resolve, dirname, relative } from "pathe";
import { globby } from "globby";
import prettyBytes from "pretty-bytes";
import { gzipSize } from "gzip-size";
import chalk from "chalk";
import { isTest } from "std-env";
import asyncPool from "tiny-async-pool";

type CollectedFile = {
  file: string;
  path: string;
  size: number;
  gzip: number;
}

async function collectFiles(dir: string, options: { compressedSizes?: boolean } = {}): Promise<CollectedFile[]> {
  const files = await globby("**/*.*", { cwd: dir, ignore: ["*.map"] });

  const arr: CollectedFile[] = [];

  // TODO: could probably take the CPU core count instead...
  const parallelism = 8;

  for await (const data of asyncPool(parallelism, files, async file => {
    const path = resolve(dir, file);
    const src = await fsp.readFile(path);
    const size = src.byteLength;
    const gzip = options.compressedSizes ? await gzipSize(src) : 0;
    return { file, path, size, gzip };
  })) {
    arr.push(data);
  };

  return arr;
}

export async function generateFSTree(
  dir: string,
  options: { compressedSizes?: boolean } = {}
) {
  if (isTest) {
    return;
  }

  const items = (await collectFiles(dir, options)).sort((a, b) => a.path.localeCompare(b.path));

  let totalSize = 0;
  let totalGzip = 0;

  let totalNodeModulesSize = 0;
  let totalNodeModulesGzip = 0;

  let treeText = "";

  for (const [index, item] of items.entries()) {
    let dir = dirname(item.file);
    if (dir === ".") {
      dir = "";
    }
    const rpath = relative(process.cwd(), item.path);
    const treeChar = index === items.length - 1 ? "└─" : "├─";

    const isNodeModules = item.file.includes("node_modules");

    if (isNodeModules) {
      totalNodeModulesSize += item.size;
      totalNodeModulesGzip += item.gzip;
      continue;
    }

    treeText += chalk.gray(
      `  ${treeChar} ${rpath} (${prettyBytes(item.size)})`
    );
    if (options.compressedSizes) {
      treeText += chalk.gray(` (${prettyBytes(item.gzip)} gzip)`);
    }
    treeText += "\n";
    totalSize += item.size;
    totalGzip += item.gzip;
  }

  treeText += `${chalk.cyan("Σ Total size:")} ${prettyBytes(
    totalSize + totalNodeModulesSize
  )}`;
  if (options.compressedSizes) {
    treeText += ` (${prettyBytes(totalGzip + totalNodeModulesGzip)} gzip)`;
  }
  treeText += "\n";

  return treeText;
}
