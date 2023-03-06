import type { Storage } from "unstorage";
import { prefixStorage } from "unstorage";
import { storage } from "#internal/nitro/virtual/storage";

export function useStorage(base = ""): Storage {
  return base ? prefixStorage(storage, base) : storage;
}
