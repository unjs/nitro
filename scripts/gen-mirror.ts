import { subpaths } from "../build.config";
import { fileURLToPath } from "mlly";
import { PackageJson, readPackageJSON } from "pkg-types";
import { writeFile, mkdir, rm, cp } from "node:fs/promises";
import { join } from "pathe";

const copyPkgFields = [
  "description",
  "keywords",
  "repository",
  "license",
  "type",
  "exports",
  "main",
  "types",
  "bin",
  "files",
];

const copyFiles = ["README.md", "LICENSE"];

// 2.x: nitropack ~> nitro
const mainPkgName = "nitropack";
const mirrrorPkgName = "nitro";

// Dirs
const mainDir = fileURLToPath(new URL("..", import.meta.url));
const mirrorDir = fileURLToPath(new URL("../.mirror", import.meta.url));

async function main() {
  // Init mirror dir
  await rm(mirrorDir, { recursive: true }).catch(() => {});
  await mkdir(mirrorDir, { recursive: true });

  // Copy package.json fields
  const mainPkg = await readPackageJSON(mainDir);
  const mirrorPkg: PackageJson = {
    name: mirrrorPkgName,
    version: `0.0.0-${mainPkg.name}-${mainPkg.version}`,
    peerDependencies: {
      [mainPkgName]: mainPkg.version!,
    },
  };
  for (const field of copyPkgFields) {
    if (mainPkg[field]) {
      mirrorPkg[field] = mainPkg[field];
    }
  }
  await writeFile(
    join(mirrorDir, "package.json"),
    JSON.stringify(mirrorPkg, null, 2)
  );

  // Generate subpath re-exports
  for (const subpath of subpaths) {
    await mkdir(join(mirrorDir, "dist", subpath), { recursive: true });
    await writeFile(
      join(mirrorDir, "dist", subpath, "index.mjs"),
      `export * from "${mainPkgName}/${subpath}";`
    );
    await writeFile(
      join(mirrorDir, "dist", subpath, "index.d.ts"),
      `export * from "${mainPkgName}/${subpath}";`
    );
    await writeFile(
      join(mirrorDir, "dist", subpath, "index.d.mts"),
      `export * from "${mainPkgName}/${subpath}";`
    );
    await writeFile(
      join(mirrorDir, `${subpath}.d.ts`),
      `export * from "./dist/${subpath}";`
    );
  }

  // Runtime Meta
  await writeFile(
    join(mirrorDir, "runtime-meta.mjs"),
    `export * from "${mainPkgName}/runtime/meta";`
  );
  await writeFile(
    join(mirrorDir, "runtime-meta.d.ts"),
    `export * from "${mainPkgName}/runtime/meta";`
  );

  // Other files
  for (const file of copyFiles) {
    await cp(join(mainDir, file), join(mirrorDir, file));
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main();
