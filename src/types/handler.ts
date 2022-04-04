import type { Handler } from 'h3'

export interface NitroEventHandler {
  /**
   * Path prefix or route
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
