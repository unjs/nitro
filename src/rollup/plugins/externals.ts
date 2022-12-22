import { existsSync, promises as fsp } from "node:fs";
import { resolve, dirname, normalize, join, isAbsolute } from "pathe";
import consola from "consola";
import { nodeFileTrace, NodeFileTraceOptions } from "@vercel/nft";
import type { Plugin } from "rollup";
import { resolvePath, isValidNodeImport, normalizeid } from "mlly";
import semver from "semver";
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
  optimizeExternals?: {
    include?: string[];
    exclude?: string[];
  };
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

      // Force trace paths
      for (const pkgName of opts.traceInclude || []) {
        const path = await this.resolve(pkgName);
        if (path?.id) {
          trackedExternals.add(path.id.replace(/\?.+/, ""));
        }
      }

      // Trace files
      const fileTrace = await nodeFileTrace(
        [...trackedExternals],
        opts.traceOptions
      );
      let tracedFiles = [...fileTrace.fileList]
        .map((f) => resolve(opts.traceOptions.base, f))
        .filter((file) => file.includes("node_modules"));

      // Resolve symlinks
      tracedFiles = await Promise.all(
        tracedFiles.map((file) => fsp.realpath(file))
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

      // Find parent base on file path
      const getParent = async (pkgPath: string) => {
        const { pkgName, baseDir } = parseNodeModulePath(pkgPath);
        const pkgVersion = await getPackageJson(resolve(baseDir, pkgName)).then(
          (r) => r.version
        );

        const possibleParents = [
          ...new Set(
            [...fileTrace.reasons]
              .filter((r) => !r[1].ignored)
              .filter((r) => parseNodeModulePath(r[0]).pkgName === pkgName)
              .flatMap((r) =>
                [...r[1].parents].filter(
                  (v) => parseNodeModulePath(v).pkgName !== pkgName
                )
              ) // Remove self-refrencing
          ),
        ];

        // Find the currect parent base on package.json dependency version
        for (const possible of possibleParents) {
          const thePath = resolve(opts.traceOptions.base, possible);
          const { pkgName: existingPkgName, baseDir: existingBaseDir } =
            parseNodeModulePath(await fsp.realpath(thePath));

          const packageJson = await getPackageJson(
            resolve(existingBaseDir, existingPkgName)
          );
          const version = packageJson.dependencies[pkgName];

          if (!version) {
            return null;
          }

          const v1 = semver.parse(version.replace(/\^|~/, "")).version;
          const v2 = semver.parse(pkgVersion).version;
          if (v1 === v2) {
            return existingPkgName;
          }
        }
        return null;
      };

      // Keep track of npm packages
      const tracedPackages = new Map(); // name => pkgDir
      const ignoreDirs = [];
      const ignoreLogs = new Set();
      const excludeOptimization = new Set(
        opts.optimizeExternals?.exclude ?? []
      );
      const includeOptimization = new Set(
        opts.optimizeExternals?.include ?? []
      );

      // Get's every tracked version of a conflicting dependency
      const getAllVersions = (pkgName: string) => {
        return [...tracedPackages]
          .filter((p) => p[0][0] === pkgName)
          .map((p) => p[0][1]);
      };
      const hasConflict = (pkgName: string, pkgVersion: string) => {
        const allVersions = getAllVersions(pkgName);
        const shouldOptimize = allVersions.filter(
          (v1) => semver.parse(v1).major !== semver.parse(pkgVersion).major
        );

        return shouldOptimize.length > 0 && !includeOptimization.has(pkgName);
      };

      for (const file of tracedFiles) {
        const { baseDir, pkgName } = parseNodeModulePath(file);
        if (!pkgName) {
          continue;
        }
        const pkgDir = resolve(baseDir, pkgName);
        const pkgVersion = await getPackageJson(pkgDir).then((r) => r.version);

        // Exclude duplicate packages with major version differance
        if (hasConflict(pkgName, pkgVersion)) {
          const log = `Multiple major versions of package \`${pkgName}\` are being externalized. Skipping optimization...`;
          if (!ignoreLogs.has(log)) {
            consola.info(log);
            ignoreLogs.add(log);
          }
          excludeOptimization.add(pkgName);
        }

        // Add to traced packages
        tracedPackages.set([pkgName, pkgVersion], pkgDir);
      }

      for (const file of tracedFiles) {
        const { baseDir, pkgName } = parseNodeModulePath(file);
        if (!pkgName) {
          continue;
        }
        const pkgDir = resolve(baseDir, pkgName);
        const pkgVersion = await getPackageJson(resolve(baseDir, pkgName)).then(
          (r) => r.version
        );

        const existingPkgVersion = getAllVersions(pkgName).find(
          (v) => v !== pkgVersion
        );
        const existingPkgDir = tracedPackages.get([pkgName, existingPkgVersion]);
        if (existingPkgDir && existingPkgDir !== pkgDir) {
          const v1 = await getPackageJson(existingPkgDir).then(
            (r) => r.version
          );
          const v2 = await getPackageJson(pkgDir).then((r) => r.version);
          const getMajor = (v: string) => v.split(".").find((s) => s !== "0");

          // Try to map traced files from one package to another for minor/patch versions
          if (
            getMajor(v1) === getMajor(v2) &&
            !excludeOptimization.has(pkgName)
          ) {
            const isNewer = semver.gt(v2, v1);

            const [newerDir, olderDir] = isNewer
              ? [pkgDir, existingPkgDir]
              : [existingPkgDir, pkgDir];

            tracedFiles = tracedFiles.map((f) =>
              f.startsWith(olderDir + "/") ? f.replace(olderDir, newerDir) : f
            );

            // Exclude older version files
            ignoreDirs.push(olderDir + "/");
            tracedPackages.delete([pkgName, v2]); // Remove the older package
          }
        }
      }

      // Filter out files from ignored packages and dedup
      tracedFiles = tracedFiles.filter(
        (f) => !ignoreDirs.some((d) => f.startsWith(d))
      );
      tracedFiles = [...new Set(tracedFiles)];

      // Ensure all package.json files are traced
      for (const pkgDir of tracedPackages.values()) {
        const pkgJSON = join(pkgDir, "package.json");
        if (!tracedFiles.includes(pkgJSON)) {
          tracedFiles.push(pkgJSON);
        }
      }

      const writeFile = async (file: string) => {
        if (!(await isFile(file))) {
          return;
        }
        const src = resolve(opts.traceOptions.base, file);
        const { pkgName, subpath } = parseNodeModulePath(file);
        let dst = resolve(opts.outDir, `node_modules/${pkgName + subpath}`);

        if (excludeOptimization.has(pkgName)) {
          const parent = await getParent(file);

          if (parent) {
            dst = resolve(
              opts.outDir,
              "node_modules",
              parent,
              "node_modules",
              pkgName + subpath
            );
          }
        }

        await fsp.mkdir(dirname(dst), { recursive: true });
        try {
          await fsp.copyFile(src, dst);
        } catch {
          consola.warn(`Could not resolve \`${src}\`. Skipping.`);
        }
      };

      // Write traced files
      await Promise.all(
        tracedFiles.map((file) => retry(() => writeFile(file), 3))
      );

      // Write an informative package.json
      const bundledDependencies = [
        ...new Set([...tracedPackages.keys()].map((p) => p[0])), // Dedup conflicting packages
      ];
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
