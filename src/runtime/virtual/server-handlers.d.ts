import type { H3EventHandler, LazyEventHandler, RouterMethod } from "h3";

type HandlerDefinition = {
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
