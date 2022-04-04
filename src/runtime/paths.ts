import { joinURL } from 'ufo'
import config from '#nitro/config'

export function baseURL (): string {
  return config.app.baseURL
}

export function buildAssetsDir (): string {
  return config.app.buildAssetsDir
}

export function buildAssetsURL (...path: string[]): string {
  return joinURL(publicAssetsURL(), config.app.buildAssetsDir, ...path)
}

export function publicAssetsURL (...path: string[]): string {
  const publicBase = config.app.cdnURL || config.app.baseURL
  return path.length ? joinURL(publicBase, ...path) : publicBase
}
