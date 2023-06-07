export const publicAssetBases: Record<string, string>;
export const isPublicAssetURL: (id: string) => boolean;
export const getPublicAssetMeta: (id: string) => { maxAge?: number };
export const readAsset: (id: string) => Promise<Buffer>;
export const getAsset: (id: string) => any;
export const getPublicAssetMatch: (id: string) => [string, string] | null;
