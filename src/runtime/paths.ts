import { joinURL } from 'ufo'
import config from '#nitro/config'

export function baseURL (): string {
  return config.nitro.baseURL
}

export function buildAssetsDir (): string {
  return config.nitro.buildAssetsDir
}

export function buildAssetsURL (...path: string[]): string {
  return joinURL(publicAssetsURL(), config.nitro.buildAssetsDir, ...path)
}

export function publicAssetsURL (...path: string[]): string {
  const publicBase = config.nitro.cdnURL || config.nitro.baseURL
  return path.length ? joinURL(publicBase, ...path) : publicBase
}
