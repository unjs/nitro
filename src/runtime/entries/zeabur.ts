import "#internal/nitro/virtual/polyfill";
import { NodeListener, toNodeListener } from "h3";
import { nitroApp } from "../app";

const handler = toNodeListener(nitroApp.h3App);

const listener: NodeListener = function (req, res) {
  return handler(req, res);
};

export default listener;
