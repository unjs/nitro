import type { H3EventHandler, LazyEventHandler, RouterMethod } from "h3";
import type { OperationObject } from "openapi-typescript";


export type ServerRouteMeta = {
    openAPI?: OperationObject,
    [key: string] : any,
}

export type HandlerDefinition = {
  route: string;
  lazy?: boolean;
  middleware?: boolean;
  handler: H3EventHandler;
  method?: RouterMethod;
  meta?: ServerRouteMeta;
} & {
  lazy: true;
  handler: LazyEventHandler;
};

export const handlers: HandlerDefinition[];

export type HandlerMeta = {
  route: string;
  method?: RouterMethod;
  meta?: ServerRouteMeta;
};

export const handlersMeta: HandlerMeta[];
