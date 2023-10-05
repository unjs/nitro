import { getContext } from "unctx";
import { Nitro } from "./types";

export const nitroCtx = getContext<Nitro>("nitro");

export function useNitro(): Nitro {
  const instance = nitroCtx.tryUse();
  if (!instance) {
    throw new Error('Nitro instance is unavailable!');
  }

  return instance
}
