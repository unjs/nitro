import { resolve } from "pathe";
import { writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

export const iisNode = defineNitroPreset({
  extends: "node-server",
  hooks: {
    async compiled(nitro: Nitro) {
      await writeFile(
        resolve(nitro.options.output.dir, "web.config"),
        iisnodeXmlTemplate()
      );

      await writeFile(
        resolve(nitro.options.output.dir, "index.js"),
        "import('./server/index.mjs');"
      );
    },
  },
});

function iisnodeXmlTemplate() {
  return `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server\\/debug[\\/]?" />
        </rule>

        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>

        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="index.js"/>
        </rule>
      </rules>
    </rewrite>

    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
          <add segment="node_modules"/>
        </hiddenSegments>
      </requestFiltering>
    </security>

    <httpErrors existingResponse="PassThrough" />

    <iisnode watchedFiles="web.config;*.js" node_env="production" debuggingEnabled="true" />
  </system.webServer>
</configuration>
`;
}
