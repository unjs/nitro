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
      let tracedFiles = await nodeFileTrace(
        [...trackedExternals],
        opts.traceOptions
      )
        .then((r) =>
          [...r.fileList].map((f) => resolve(opts.traceOptions.base, f))
        )
        .then((r) => r.filter((file) => file.includes("node_modules")));

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
      for (const file of tracedFiles) {
        const { baseDir, pkgName } = parseNodeModulePath(file);
        if (!pkgName) {
          continue;
        }
        let pkgDir = resolve(baseDir, pkgName);

        // Check for duplicate versions
        const existingPkgDir = tracedPackages.get(pkgName);
        if (existingPkgDir && existingPkgDir !== pkgDir) {
          const v1 = await getPackageJson(existingPkgDir).then(
            (r) => r.version
          );
          const v2 = await getPackageJson(pkgDir).then((r) => r.version);
          const isNewer = semver.gt(v2, v1);

          // Warn about major version differences
          const getMajor = (v: string) => v.split(".").find((s) => s !== "0");
          if (
            getMajor(v1) !== getMajor(v2) &&
            !includeOptimization.has(pkgName)
          ) {
            const log = `Multiple major versions of package \`${pkgName}\` are being externalized. Skipping optimization...`;
            if (!ignoreLogs.has(log)) {
              consola.info(log);
              ignoreLogs.add(log);
            }
            excludeOptimization.add(pkgName);
          }

          const [newerDir, olderDir] = isNewer
            ? [pkgDir, existingPkgDir]
            : [existingPkgDir, pkgDir];
          // Try to map traced files from one package to another for minor/patch versions
          if (getMajor(v1) === getMajor(v2)) {
            tracedFiles = tracedFiles.map((f) =>
              f.startsWith(olderDir + "/") ? f.replace(olderDir, newerDir) : f
            );
          }
          // Exclude older version files
          if (
            includeOptimization.has(pkgName) &&
            !excludeOptimization.has(pkgName)
          ) {
            ignoreDirs.push(olderDir + "/");
          }
          pkgDir = newerDir; // Update for tracedPackages
        }

        // Add to traced packages
        tracedPackages.set(pkgName, pkgDir);
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
        const { pkgName, subpath, baseDir } = parseNodeModulePath(file);
        const version = await getPackageJson(resolve(baseDir, pkgName)).then(
          (r) => r.version
        );
        const fullName = excludeOptimization.has(pkgName)
          ? `${pkgName}@${version}`
          : pkgName;
        const dst = resolve(opts.outDir, `node_modules/${fullName + subpath}`);
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
      await fsp.writeFile(
        resolve(opts.outDir, "package.json"),
        JSON.stringify(
          {
            name: "nitro-output",
            version: "0.0.0",
            private: true,
            bundledDependencies: [...tracedPackages.keys()],
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
