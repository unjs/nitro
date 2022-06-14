import type { CompatibilityEventHandler, LazyEventHandler, RouterMethod } from 'h3'

type HandlerDefinition = {
  route: string
  lazy?: boolean
  middleware?: boolean
  handler: CompatibilityEventHandler
  method?: RouterMethod
} & {
  lazy: true
  handler: LazyEventHandler
}

export const handlers: HandlerDefinition[]
