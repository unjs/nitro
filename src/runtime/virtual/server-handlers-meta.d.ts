import type { RouterMethod } from "h3";
import type { OperationObject } from "openapi-typescript";

export type HandlerMeta = {
  route: string;
  method?: RouterMethod;
  meta?: {
    openAPI?: OperationObject;
  };
};

export const handlersMeta: HandlerMeta[];
