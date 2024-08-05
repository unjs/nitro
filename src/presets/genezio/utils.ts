import { resolve, dirname } from "pathe";
import fsp from "node:fs/promises";
import type { Nitro } from "nitropack/types";
export async function generateFunctionFiles(nitro: Nitro) {
  const name = await getNameFromPackage();
  const initialPath = dirname(nitro.options.output.dir);
  const genezioConfigPath = resolve(initialPath, "genezio.yaml");
  const genezioConfigContent = `
  # The name of the project.
  name: ${name}
  # The version of the Genezio YAML configuration to parse.
  yamlVersion: 2
  backend:
    # The root directory of the backend.
    path: .output/
    # Information about the backend's programming language.
    language:
        # The name of the programming language.
        name: js
        # The package manager used by the backend.
        packageManager: npm
    # Information about the backend's functions.    
    functions:
        # The name (label) of the function.
        - name: nitroServer
        # The path to the function's code.
          path: server/
          # The name of the function handler
          handler: handler
          # The entry point for the function.
          entry: index.mjs
  `.trim();
  try {
    await fsp.writeFile(genezioConfigPath, genezioConfigContent, {
      flag: "wx",
    });
  } catch {
    return;
  }
}
async function getNameFromPackage() {
  const defaultName = "nitro-app";
  try {
    const packageLockContent = await fsp.readFile("package-lock.json", "utf8");
    const packageLockJson = JSON.parse(packageLockContent);
    if (packageLockJson.name) {
      return packageLockJson.name;
    }
    return defaultName;
  } catch {
    return defaultName;
  }
}
