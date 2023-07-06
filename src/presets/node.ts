import { defineNitroPreset } from "../preset";
import {
  exportConditions,
  nodeExportConditions,
} from "../utils/export-conditions";

export const node = defineNitroPreset({
  entry: "#internal/nitro/entries/node",
  exportConditions: exportConditions("node", nodeExportConditions),
});
