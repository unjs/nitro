declare module '#storage' {
  import type { Storage } from 'unstorage'
  export const storage: Storage
}

declare module '#assets' {
  export interface AssetMeta { type?: string, etag?: string, mtime?: string }
  export function readAsset<T = any> (id: string): Promise<T>
  export function statAsset (id: string): Promise<AssetMeta>
  export function getKeys() : Promise<string[]>
}

declare module '#config' {
  export const privateConfig: Record<string, any>
  export const publicConfig: Record<string, any>
  const runtimeConfig: PrivateRuntimeConfig & PublicRuntimeConfig
  export default runtimeConfig
}

declare module '#paths' {
  export const baseURL: () => string
  export const buildAssetsDir: () => string

  export const buildAssetsURL: (...path: string[]) => string
  export const publicAssetsURL: (...path: string[]) => string
}
