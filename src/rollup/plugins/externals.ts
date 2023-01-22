import { existsSync, promises as fsp } from "node:fs";
import { resolve, dirname, normalize, join, isAbsolute } from "pathe";
import { nodeFileTrace, NodeFileTraceOptions } from "@vercel/nft";
import type { Plugin } from "rollup";
import { resolvePath, isValidNodeImport, normalizeid } from "mlly";
import { isDirectory, retry } from "../../utils";

export interface NodeExternalsOptions {
  inline?: string[];
  external?: string[];
  outDir?: string;
  trace?: boolean;
  traceOptions?: NodeFileTraceOptions;
  moduleDirectories?: string[];
  exportConditions?: string[];
  traceInclude?: string[];
}

export function externals(opts: NodeExternalsOptions): Plugin {
  const trackedExternals = new Set<string>();

  const _resolveCache = new Map();
  const _resolve = async (id: string) => {
    let resolved = _resolveCache.get(id);
    if (resolved) {
      return resolved;
    }
    resolved = await resolvePath(id, {
      conditions: opts.exportConditions,
      url: opts.moduleDirectories,
    });
    _resolveCache.set(id, resolved);
    return resolved;
  };

  // Normalize options
  opts.inline = (opts.inline || []).map((p) => normalize(p));
  opts.external = (opts.external || []).map((p) => normalize(p));

  return {
    name: "node-externals",
    async resolveId(originalId, importer, options) {
      // Skip internals
      if (
        !originalId ||
        originalId.startsWith("\u0000") ||
        originalId.includes("?") ||
        originalId.startsWith("#")
      ) {
        return null;
      }

      // Skip relative paths
      if (originalId.startsWith(".")) {
        return null;
      }

      // Normalize path (windows)
      const id = normalize(originalId);

      // Id without .../node_modules/
      const idWithoutNodeModules = id.split("node_modules/").pop();

      // Check for explicit inlines
      if (
        opts.inline.some(
          (i) => id.startsWith(i) || idWithoutNodeModules.startsWith(i)
        )
      ) {
        return null;
      }

      // Check for explicit externals
      if (
        opts.external.some(
          (i) => id.startsWith(i) || idWithoutNodeModules.startsWith(i)
        )
      ) {
        return { id, external: true };
      }

      // Resolve id using rollup resolver
      const resolved = (await this.resolve(originalId, importer, {
        ...options,
        skipSelf: true,
      })) || { id };

      // Try resolving with mlly as fallback
      if (
        !isAbsolute(resolved.id) ||
        !existsSync(resolved.id) ||
        (await isDirectory(resolved.id))
      ) {
        resolved.id = await _resolve(resolved.id).catch(() => resolved.id);
      }

      // Inline invalid node imports
      if (!(await isValidNodeImport(resolved.id).catch(() => false))) {
        return null;
      }

      // Externalize with full path if trace is disabled
      if (opts.trace === false) {
        return {
          ...resolved,
          id: isAbsolute(resolved.id) ? normalizeid(resolved.id) : resolved.id,
          external: true,
        };
      }

      // -- Trace externals --

      // Try to extract package name from path
      const { pkgName, subpath } = parseNodeModulePath(resolved.id);

      // Inline if cannot detect package name
      if (!pkgName) {
        return null;
      }

      // Normally package name should be same as originalId
      // Edge cases: Subpath export and full paths
      if (pkgName !== originalId) {
        // Subpath export
        if (!isAbsolute(originalId)) {
          const fullPath = await _resolve(originalId);
          trackedExternals.add(fullPath);
          return {
            id: originalId,
            external: true,
          };
        }

        // Absolute path, we are not sure about subpath to generate import statement
        // Guess as main subpath export
        const packageEntry = await _resolve(pkgName).catch(() => null);
        if (packageEntry !== originalId) {
          // Guess subpathexport
          const guessedSubpath = pkgName + subpath.replace(/\.[a-z]+$/, "");
          const resolvedGuess = await _resolve(guessedSubpath).catch(
            () => null
          );
          if (resolvedGuess === originalId) {
            trackedExternals.add(resolvedGuess);
            return {
              id: guessedSubpath,
              external: true,
            };
          }
          // Inline since we cannot guess subpath
          return null;
        }
      }

      trackedExternals.add(resolved.id);
      return {
        id: pkgName,
        external: true,
      };
    },
    async buildEnd() {
      if (opts.trace === false) {
        return;
      }

      // Manually traced paths
      for (const pkgName of opts.traceInclude || []) {
        const path = await this.resolve(pkgName);
        if (path?.id) {
          trackedExternals.add(path.id.replace(/\?.+/, ""));
        }
      }

      // Trace used files using nft
      const _fileTrace = await nodeFileTrace(
        [...trackedExternals],
        opts.traceOptions
      );

      // Read package.json with cache
      const packageJSONCache = new Map(); // pkgDir => contents
      const getPackageJson = async (pkgDir: string) => {
        if (packageJSONCache.has(pkgDir)) {
          return packageJSONCache.get(pkgDir);
        }
        const pkgJSON = JSON.parse(
          await fsp.readFile(resolve(pkgDir, "package.json"), "utf8")
        );
        packageJSONCache.set(pkgDir, pkgJSON);
        return pkgJSON;
      };

      // Resolve traced files
      type TracedFile = {
        path: string;
        subpath: string;
        parents: string[];

        pkgPath: string;
        pkgName: string;
        pkgVersion: string;
      };
      const _resolveTracedPath = (p) =>
        fsp.realpath(resolve(opts.traceOptions.base, p));
      const tracedFiles: Record<string, TracedFile> = Object.fromEntries(
        await Promise.all(
          [..._fileTrace.reasons.entries()].map(async ([_path, reasons]) => {
            if (reasons.ignored) {
              return;
            }
            const path = await _resolveTracedPath(_path);
            if (!path.includes("node_modules")) {
              return;
            }
            if (!(await isFile(path))) {
              return;
            }
            const { baseDir, pkgName, subpath } = parseNodeModulePath(path);
            const pkgPath = join(baseDir, pkgName);
            const parents = await Promise.all(
              [...reasons.parents].map((p) => _resolveTracedPath(p))
            );
            const tracedFile = <TracedFile>{
              path,
              parents,

              subpath,
              pkgName,
              pkgPath,
            };
            return [path, tracedFile];
          })
        ).then((r) => r.filter(Boolean))
      );

      // Resolve traced packages
      type TracedPackage = {
        name: string;
        versions: Record<
          string,
          {
            path: string;
            files: string[];
          }
        >;
      };
      const tracedPackages: Record<string, TracedPackage> = {};
      await Promise.all(
        Object.values(tracedFiles).map(async (tracedFile) => {
          const pkgJSON = await getPackageJson(tracedFile.pkgPath);
          const pkgName = tracedFile.pkgName; // Use file path as name to support aliases
          let tracedPackage = tracedPackages[pkgName];
          if (!tracedPackage) {
            tracedPackage = {
              name: pkgName,
              versions: {},
            };
            tracedPackages[pkgName] = tracedPackage;
          }
          let tracedPackageVersion = tracedPackage.versions[pkgJSON.version];
          if (!tracedPackageVersion) {
            tracedPackageVersion = { path: tracedFile.pkgPath, files: [] };
            tracedPackage.versions[pkgJSON.version] = tracedPackageVersion;
          }
          tracedPackageVersion.files.push(tracedFile.path);
          tracedFile.pkgName = pkgName;
          tracedFile.pkgVersion = pkgJSON.version;
        })
      );

      const writePackage = async (
        name: string,
        version: string,
        outputName?: string
      ) => {
        // Find pkg
        const pkg = tracedPackages[name];

        // Copy files
        for (const src of pkg.versions[version].files) {
          const { subpath } = parseNodeModulePath(src);
          const dst = join(
            opts.outDir,
            "node_modules",
            outputName || pkg.name,
            subpath
          );
          await fsp.mkdir(dirname(dst), { recursive: true });
          await fsp.copyFile(src, dst);
        }

        // Copy package.json
        const pkgJSONPath = join(
          opts.outDir,
          "node_modules",
          outputName || pkg.name,
          "package.json"
        );
        await fsp.mkdir(dirname(pkgJSONPath), { recursive: true });
        await fsp.copyFile(
          join(pkg.versions[version].path, "package.json"),
          pkgJSONPath
        );
      };

      const linkPackage = async (from: string, to: string) => {
        const src = join(opts.outDir, "node_modules", from);
        const dst = join(opts.outDir, "node_modules", to);
        if (existsSync(dst)) {
          return; // TODO: Warn?
        }
        await fsp.mkdir(dirname(dst), { recursive: true });
        // TODO: Use copy for windows for portable output?
        await fsp.symlink(src, dst, "junction").catch((err) => {
          console.error("Cannot link", src, "to", dst, ":", err.message);
        });
      };

      // Utility to find package parents
      const findPackageParents = (pkg: TracedPackage, version: string) => {
        // Try to find parent packages
        const versionFiles: TracedFile[] = pkg.versions[version].files.map(
          (path) => tracedFiles[path]
        );
        const parentPkgs = [
          ...new Set(
            versionFiles.flatMap((file) =>
              file.parents
                .map((parentPath) => {
                  const parentFile = tracedFiles[parentPath];
                  if (parentFile.pkgName === pkg.name) {
                    return null;
                  }
                  return `${parentFile.pkgName}@${parentFile.pkgVersion}`;
                })
                .filter(Boolean)
            )
          ),
        ];
        return parentPkgs;
      };

      // Write traced packages
      await Promise.all(
        Object.values(tracedPackages).map(async (tracedPackage) => {
          const versions = Object.keys(tracedPackage.versions); // TODO: sort by semver
          if (versions.length === 1) {
            // Write the only version into node_modules/{name}
            await writePackage(tracedPackage.name, versions[0]);
          } else {
            for (const version of versions) {
              const parentPkgs = findPackageParents(tracedPackage, version);
              if (parentPkgs.length === 0) {
                // No parent packages, assume as the hoisted version
                await writePackage(tracedPackage.name, version);
              } else {
                // Write alternative version into node_modules/{name}@{version}
                await writePackage(
                  tracedPackage.name,
                  version,
                  `${tracedPackage.name}@${version}`
                );
                // For each parent, link into node_modules/{parent}/node_modules/{name}
                for (const parentPath of parentPkgs) {
                  await linkPackage(
                    `${tracedPackage.name}@${version}`,
                    `${parentPath}/node_modules/${tracedPackage.name}`
                  );
                  await linkPackage(
                    `${tracedPackage.name}@${version}`,
                    `${parentPath.split("@")[0]}/node_modules/${
                      tracedPackage.name
                    }`
                  );
                }
              }
            }
          }
        })
      );

      // Write an informative package.json
      const bundledDependencies = Object.fromEntries(
        Object.values(tracedPackages).map((pkg) => [
          pkg.name,
          Object.keys(pkg.versions).join(" | "),
        ])
      );
      await fsp.writeFile(
        resolve(opts.outDir, "package.json"),
        JSON.stringify(
          {
            name: "nitro-output",
            version: "0.0.0",
            private: true,
            bundledDependencies,
          },
          null,
          2
        ),
        "utf8"
      );
    },
  };
}

function parseNodeModulePath(path: string) {
  if (!path) {
    return {};
  }
  const match = /^(.+\/node_modules\/)([^/@]+|@[^/]+\/[^/]+)(\/?.*?)?$/.exec(
    normalize(path)
  );
  if (!match) {
    return {};
  }
  const [, baseDir, pkgName, subpath] = match;
  return {
    baseDir,
    pkgName,
    subpath,
  };
}

async function isFile(file: string) {
  try {
    const stat = await fsp.stat(file);
    return stat.isFile();
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    }
    throw err;
  }
}
