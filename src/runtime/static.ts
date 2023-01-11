import { eventHandler, createError } from "h3";
import { joinURL, withoutTrailingSlash, withLeadingSlash, parseURL } from "ufo";
import {
  getAsset,
  readAsset,
  isPublicAssetURL,
} from "#internal/nitro/virtual/public-assets";

const METHODS = new Set(["HEAD", "GET"]);

const EncodingMap = { gzip: ".gz", br: ".br" };

export default eventHandler((event) => {
  if (event.node.req.method && !METHODS.has(event.node.req.method)) {
    return;
  }

  let id = decodeURIComponent(
    withLeadingSlash(
      withoutTrailingSlash(parseURL(event.node.req.url).pathname)
    )
  );
  let asset;

  const encodingHeader = String(
    event.node.req.headers["accept-encoding"] || ""
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
    event.node.res.setHeader("Vary", "Accept-Encoding");
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
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404,
      });
    }
    return;
  }

  const ifNotMatch = event.node.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.node.res.statusCode = 304;
    event.node.res.end();
    return;
  }

  const ifModifiedSinceH = event.node.req.headers["if-modified-since"];
  if (
    ifModifiedSinceH &&
    asset.mtime &&
    new Date(ifModifiedSinceH) >= new Date(asset.mtime)
  ) {
    event.node.res.statusCode = 304;
    event.node.res.end();
    return;
  }

  if (asset.type && !event.node.res.getHeader("Content-Type")) {
    event.node.res.setHeader("Content-Type", asset.type);
  }

  if (asset.etag && !event.node.res.getHeader("ETag")) {
    event.node.res.setHeader("ETag", asset.etag);
  }

  if (asset.mtime && !event.node.res.getHeader("Last-Modified")) {
    event.node.res.setHeader("Last-Modified", asset.mtime);
  }

  if (asset.encoding && !event.node.res.getHeader("Content-Encoding")) {
    event.node.res.setHeader("Content-Encoding", asset.encoding);
  }

  if (asset.size > 0 && !event.node.res.getHeader("Content-Length")) {
    event.node.res.setHeader("Content-Length", asset.size);
  }

  // TODO: Asset dir cache control
  // if (isBuildAsset) {
  // const TWO_DAYS = 2 * 60 * 60 * 24
  // event.node.res.setHeader('Cache-Control', `max-age=${TWO_DAYS}, immutable`)
  // }

  return readAsset(id);
});
