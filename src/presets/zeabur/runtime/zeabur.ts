import "#internal/nitro/virtual/polyfill";
import { nitroApp } from "#internal/nitro/app";
import { NodeListener, toNodeListener } from "h3";

const handler = toNodeListener(nitroApp.h3App);

const listener: NodeListener = function (req, res) {
  return handler(req, res);
};

export default listener;
