import { resolve } from "pathe";
import { readFile, resolveFile, writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

export const iis = defineNitroPreset({
  extends: "node-server",
  hooks: {
    async compiled(nitro: Nitro) {
      await writeFile(
        resolve(nitro.options.output.dir, "web.config"),
        await iisXmlTemplate(nitro)
      );
    },
  },
});

async function iisXmlTemplate(nitro: Nitro) {
  const path = resolveFile("web.config", nitro.options.rootDir, ["config"]);
  const originalString = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="httpPlatformHandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified" requireAccess="Script" />
    </handlers>
    <httpPlatform stdoutLogEnabled="true" stdoutLogFile=".\\logs\\node.log" startupTimeLimit="20" processPath="C:\\Program Files\\nodejs\\node.exe" arguments=".\\server\\index.mjs">
      <environmentVariables>
        <environmentVariable name="PORT" value="%HTTP_PLATFORM_PORT%" />
        <environmentVariable name="NODE_ENV" value="Production" />
      </environmentVariables>
    </httpPlatform>
  </system.webServer>
</configuration>
`;
  if (path !== undefined) {
    const fileString = readFile(path);
    const originalWebConfig: Record<string, unknown> =
      await parseXmlDoc(originalString);
    const fileWebConfig: Record<string, unknown> =
      await parseXmlDoc(fileString);

    if (nitro.options.iis.mergeConfig && !nitro.options.iis.overrideConfig) {
      return buildNewXmlDoc({ ...originalWebConfig, ...fileWebConfig });
    } else if (nitro.options.iis.overrideConfig) {
      return buildNewXmlDoc({ ...fileWebConfig });
    }
  }
  return originalString;
}

//  XML Helpers
async function parseXmlDoc(xml: string): Promise<Record<string, unknown>> {
  const { Parser } = await import("xml2js");

  if (xml === undefined || !xml) {
    return {};
  }
  const parser = new Parser();
  let parsedRecord: Record<string, unknown>;
  parser.parseString(xml, function (_, r) {
    parsedRecord = r;
  });
  return parsedRecord;
}

async function buildNewXmlDoc(
  xmlObj: Record<string, unknown>
): Promise<string> {
  const { Builder } = await import("xml2js");
  const builder = new Builder();
  return builder.buildObject({ ...xmlObj });
}
