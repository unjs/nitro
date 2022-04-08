import type { CompatibilityEventHandler } from 'h3'

interface HandlerDefinition {
  route: string
  lazy?: boolean
  handler: CompatibilityEventHandler | (() => Promise<CompatibilityEventHandler>)
  method?: 'connect'| 'delete'| 'get'| 'head'| 'options'| 'post'| 'put'| 'trace'
}

export const handlers: HandlerDefinition[]
