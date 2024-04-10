import type { OperationObject } from "openapi-typescript";
import { NitroRouteMeta } from "../../types";

export const handlersMeta: {
  route?: string;
  method?: string;
  meta?: NitroRouteMeta;
}[];
