import type { CompatibilityEventHandler, LazyEventHandler, RouterMethod } from 'h3'

type HandlerDefinition = {
  route: string
  middleware?: boolean
  method?: RouterMethod
}
& {
  lazy?: true
  handler: LazyEventHandler | (() => Promise<LazyEventHandler>)
}
& {
  lazy?: false
  handler: CompatibilityEventHandler | (() => Promise<CompatibilityEventHandler>)
}

export const handlers: HandlerDefinition[]
