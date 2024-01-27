import type { Storage, StorageValue } from "unstorage";
import { prefixStorage } from "unstorage";
import { mountPoints } from "#internal/storage";
import { storage } from "#internal/nitro/virtual/storage";

export function useStorage<
  T extends StorageValue = StorageValue,
  U extends keyof typeof mountPoints,
>(base: U = ""): Storage<T> {
  return base ? prefixStorage<T>(storage, base) : storage;
}
