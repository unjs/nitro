export const publicAssetBases: string[];
export const isPublicAssetURL: (id: string) => boolean;
export const getPublicAssetMeta: (id: string) => { maxAge?: number };
export const readAsset: (id: string) => Promise<Buffer>;
export const getAsset: (id: string) => PublicAsset;

export interface PublicAsset {
  type: string;
  etag: string;
  mtime: string;
  path: string;
  size: number;
  encoding?: string;
}
