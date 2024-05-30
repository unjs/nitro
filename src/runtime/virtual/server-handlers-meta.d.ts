import type { OperationObject } from "openapi-typescript";
import { NitroRouteMeta } from "nitropack/types";

export const handlersMeta: {
  route?: string;
  method?: string;
  meta?: NitroRouteMeta;
}[];
