import {
  eventHandler,
  createError,
  getRequestHeader,
  getResponseHeader,
  setResponseHeader,
  setResponseStatus,
  removeResponseHeader,
} from "h3";
import {
  decodePath,
  joinURL,
  parseURL,
  withLeadingSlash,
  withoutTrailingSlash,
} from "ufo";
import {
  getAsset,
  readAsset,
  isPublicAssetURL,
} from "#internal/nitro/virtual/public-assets";
import type { PublicAsset } from "#internal/nitro/virtual/public-assets";

const METHODS = new Set(["HEAD", "GET"]);

const EncodingMap = { gzip: ".gz", br: ".br" };

export default eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }

  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset: PublicAsset;

  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader
      .split(",")
      .map((e) => EncodingMap[e.trim()])
      .filter(Boolean)
      .sort(),
    "",
  ];
  if (encodings.length > 1) {
    setResponseHeader(event, "Vary", "Accept-Encoding");
  }

  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }

  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404,
      });
    }
    return;
  }

  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }

  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (
    ifModifiedSinceH &&
    asset.mtime &&
    new Date(ifModifiedSinceH) >= mtimeDate
  ) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }

  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }

  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }

  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }

  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }

  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }

  return readAsset(id);
});
