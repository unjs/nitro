import { upperFirst } from "scule";
import { Nitro } from "nitropack/types";

export function nitroServerName(nitro: Nitro) {
  return nitro.options.framework.name === "nitro"
    ? "Nitro Server"
    : `${upperFirst(nitro.options.framework.name as string)} Nitro server`;
}
