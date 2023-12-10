import type { Storage, StorageValue } from "unstorage";
import { prefixStorage } from "unstorage";
import { storage } from "#internal/nitro/virtual/storage";
import { mountPoints } from "../storage";

export function useStorage<T extends StorageValue = StorageValue>(
  base: keyof typeof mountPoints | undefined | '' = ''
): Storage<T> {
  return base ? prefixStorage<T>(storage, base) : storage;
}
