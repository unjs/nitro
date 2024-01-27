import type { Storage, StorageValue } from "unstorage";
import { prefixStorage } from "unstorage";
import { Mounts } from "../storage";
import { storage } from "#internal/nitro/virtual/storage";

export function useStorage<T extends StorageValue = StorageValue>(
  base: keyof Mounts = ""
): Storage<T> {
  return base ? prefixStorage<T>(storage, base) : storage;
}
