import "#internal/nitro/virtual/polyfill";
import { toNodeListener, NodeListener } from "h3";
import { parseQuery } from "ufo";
import { nitroApp } from "../app";

// @todo apply defineNitroResponse
const handler = toNodeListener(nitroApp.h3App);

export default <NodeListener>function (req, res) {
  const query = req.headers["x-now-route-matches"] as string;
  if (query) {
    const { url } = parseQuery(query);
    if (url) {
      req.url = url as string;
    }
  }
  return handler(req, res);
};
