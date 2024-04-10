import type { OperationObject } from "openapi-typescript";

export interface NitroRouteMeta {
  openAPI?: OperationObject;
}

export function defineRouteMeta(meta: NitroRouteMeta) {
  return meta;
}
