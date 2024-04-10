import type { OperationObject } from "openapi-typescript";
import { NitroRouteMeta } from "../meta";

export const handlersMeta: {
  route?: string;
  method?: string;
  meta?: NitroRouteMeta;
}[];
