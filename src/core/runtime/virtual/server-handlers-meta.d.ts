import type { OperationObject } from "openapi-typescript";
import { NitroRouteMeta } from "nitropack/schema";

export const handlersMeta: {
  route?: string;
  method?: string;
  meta?: NitroRouteMeta;
}[];
