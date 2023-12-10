import type { Storage, StorageValue } from "unstorage";
import { prefixStorage } from "unstorage";
import { storage } from "#internal/nitro/virtual/storage";
import {mountPoints} from "../../utils/storage"
import type {StorageKeys} from "../../types/utils"

export function useStorage<T extends StorageValue = StorageValue>(
  base = StorageKeys<typeof mountPoints> | undefined
): Storage<T> {
  return base ? prefixStorage<T>(storage, base) : storage;
}
