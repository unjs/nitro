import "#nitro-internal-pollyfills";
import { useNitroApp } from "nitro/runtime";
import { NodeListener, toNodeListener } from "h3";

const handler = toNodeListener(useNitroApp().h3App);

const listener: NodeListener = function (req, res) {
  return handler(req, res);
};

export default listener;
