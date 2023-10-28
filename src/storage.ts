import { createStorage as _createStorage, builtinDrivers } from "unstorage";
import type { Nitro } from "./types";

export async function createStorage(nitro: Nitro) {
  const storage = _createStorage();

  const mounts = {
    ...nitro.options.storage,
    ...nitro.options.devStorage,
  };

  for (const [path, opts] of Object.entries(mounts)) {
    if (opts.driver) {
      const driver = await import(
        builtinDrivers[opts.driver] || opts.driver
      ).then((r) => r.default || r);
      storage.mount(path, driver(opts));
    } else {
      nitro.logger.warn(`No \`driver\` set for storage mount point "${path}".`);
    }
  }

  return storage;
}

export async function snapshotStorage(nitro: Nitro) {
  const data: Record<string, any> = {};

  const allKeys = [
    ...new Set(
      await Promise.all(
        nitro.options.bundledStorage.map((base) => nitro.storage.getKeys(base))
      ).then((r) => r.flat())
    ),
  ];

  await Promise.all(
    allKeys.map(async (key) => {
      data[key] = await nitro.storage.getItem(key);
    })
  );

  return data;
}
