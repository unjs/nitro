import type { Storage, StorageValue } from "unstorage";
import { prefixStorage } from "unstorage";
// @ts-ignore
import { storage } from "#internal/nitro/virtual/storage";

export function useStorage<T extends StorageValue = StorageValue>(
  base = ""
): Storage<T> {
  return base ? prefixStorage<T>(storage, base) : storage;
}
