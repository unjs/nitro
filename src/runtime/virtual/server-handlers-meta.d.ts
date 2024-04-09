import type { OperationObject } from "openapi-typescript";
import { NitroRouteMeta } from "../handler";

export const handlersMeta: {
  route: string;
  method: string;
  meta: NitroRouteMeta;
}[];
