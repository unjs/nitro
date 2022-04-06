import type { CompatibilityEventHandler } from 'h3'

interface HandlerDefinition {
  route: string
  lazy?: boolean
  handler: CompatibilityEventHandler | (() => Promise<CompatibilityEventHandler>)
}

export const handlers: HandlerDefinition[]
