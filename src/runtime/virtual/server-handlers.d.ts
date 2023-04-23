import type { H3EventHandler, LazyEventHandler, RouterMethod } from "h3";

export type HandlerDefinition = {
  route: string;
  lazy?: boolean;
  middleware?: boolean;
  handler: H3EventHandler;
  method?: RouterMethod;
} & {
  lazy: true;
  handler: LazyEventHandler;
};

export const handlers: HandlerDefinition[];

export type HandlerMeta = {
  route: string;
  method?: RouterMethod;
};

export const handlersMeta: HandlerMeta[];
