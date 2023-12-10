import type { Storage, StorageValue } from "unstorage";
import { prefixStorage } from "unstorage";
import { mountPoints } from "../utils/storage";
import { storage } from "#internal/nitro/virtual/storage";

export function useStorage<T extends StorageValue = StorageValue>(
  base: keyof typeof mountPoints = ""
): Storage<T> {
  return base ? prefixStorage<T>(storage, base) : storage;
}
