import { builtinDrivers } from "unstorage";
import { genImport, genSafeVariableName } from "knitwork";
import type { Nitro } from "../../types";
import { virtual } from "./virtual";

export function storage(nitro: Nitro) {
  const mounts: { path: string; driver: string; opts: object }[] = [];

  const isDevOrPrerender =
    nitro.options.dev || nitro.options.preset === "nitro-prerender";
  const storageMounts = isDevOrPrerender
    ? { ...nitro.options.storage, ...nitro.options.devStorage }
    : nitro.options.storage;

  for (const path in storageMounts) {
    const mount = storageMounts[path];
    mounts.push({
      path,
      driver: builtinDrivers[mount.driver] || mount.driver,
      opts: mount,
    });
  }

  const driverImports = [...new Set(mounts.map((m) => m.driver))];

  const bundledStorageCode = `
import overlay from 'unstorage/drivers/overlay'
import memory from 'unstorage/drivers/memory'

const bundledStorage = ${JSON.stringify(nitro.options.bundledStorage)}
for (const base of bundledStorage) {
  storage.mount(base, overlay({
    layers: [
      memory(),
      // TODO
      // prefixStorage(storage, base),
      prefixStorage(storage, 'assets:nitro:bundled:' + base)
    ]
  }))
}`;

  return virtual(
    {
      "#internal/nitro/virtual/storage": `
import { createStorage, prefixStorage } from 'unstorage'
import { assets } from '#internal/nitro/virtual/server-assets'

${driverImports.map((i) => genImport(i, genSafeVariableName(i))).join("\n")}

export const storage = createStorage({})

storage.mount('/assets', assets)

${mounts
  .map(
    (m) =>
      `storage.mount('${m.path}', ${genSafeVariableName(
        m.driver
      )}(${JSON.stringify(m.opts)}))`
  )
  .join("\n")}

${
  !isDevOrPrerender && nitro.options.bundledStorage.length > 0
    ? bundledStorageCode
    : ""
}
`,
    },
    nitro.vfs
  );
}
