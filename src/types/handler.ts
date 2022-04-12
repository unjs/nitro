import type { Handler, CompatibilityEvent } from 'h3'

export interface NitroEventHandler {
  /**
   * Path prefix or route
   *
   * If an empty string used, will be used as a middleware
   */
  route?: string

  /**
   * Use lazy loading to import handler
   */
  lazy?: boolean

  /**
   * Path to event handler
   *
   */
  handler: string

  /**
   * Router method matcher
   */
  method?: string
}

export interface NitroDevEventHandler {
  /**
   * Path prefix or route
   */
  route?: string

  /**
   * Event handler
   *
   */
  handler: Handler
}

export type NitroErrorHandler = (error: Error, event: CompatibilityEvent) => void | Promise<void>
