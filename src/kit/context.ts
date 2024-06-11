import { getContext } from "unctx";
import { Nitro } from "../types/nitro";

/** Direct access to the Nitro context. */
export const nitroContext = getContext<Nitro>("nitro");

export function useNitro(): Nitro {
  const instance = nitroContext.tryUse();
  if (!instance) {
    throw new Error("Nitro context not found!");
  }
  return instance;
}
