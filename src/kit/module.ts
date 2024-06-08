import { NitroModule } from "../types/module";

export function defineNitroModule(def: NitroModule): NitroModule {
  if (typeof def?.setup !== "function") {
    def.setup = () => {
      throw new TypeError("NitroModule must implement a `setup` method!");
    };
  }
  return def;
}
