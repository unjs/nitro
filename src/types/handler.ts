import type { Handler } from 'h3'

export interface NitroHandlerConfig {
  /**
   * Path prefix or route
   */
  route?: string

  /**
   * Use lazy loading to import handler
   */
  lazy?: boolean

  /**
   * Handler
   *
   * Note: Handler as function only works during development and will be removed from production bundle
   */
  handler: string | Handler
}
