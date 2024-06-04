import type { Storage, StorageValue } from "unstorage";
import { prefixStorage } from "unstorage";
import { storage } from "#nitro-internal-virtual/storage";

export function useStorage<T extends StorageValue = StorageValue>(
  base = ""
): Storage<T> {
  return base ? prefixStorage<T>(storage, base) : storage;
}
