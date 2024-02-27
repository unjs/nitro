import "#internal/nitro/virtual/polyfill";
import { NodeListener, toNodeListener } from "h3";
import { nitroApp } from "../app";

const handler = toNodeListener(nitroApp.h3App);

export default <NodeListener>function (req, res) {
  return handler(req, res);
};
