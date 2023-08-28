import { resolve } from "pathe";
import { Parser, Builder, parseString } from "xml2js"
import { readFile, resolveFile, writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";
export const iisNode = defineNitroPreset({
  extends: "node-server",
  hooks: {
    async compiled(nitro: Nitro) {
        await writeFile(
        resolve(nitro.options.output.dir, "web.config"),
        iisnodeXmlTemplate(nitro)
      );

      await writeFile(
        resolve(nitro.options.output.dir, "index.js"),
        "import('./server/index.mjs');"
      );
    },
  },
});

function iisnodeXmlTemplate(nitro: Nitro) {
    const parser = new Parser()
    const path = resolveFile( 'web.config', nitro.options.rootDir, ["config"])
    const originalString = `<?xml version="1.0" encoding="utf-8"?>
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
`
    const fileString = readFile(path)
console.log({options: nitro.options.runtimeConfig})
    let originalWebConfig: Record<string, unknown>, fileWebConfig: Record<string, unknown>

    parser.parseString(originalString, function (e, r) {
        originalWebConfig = r
        return r
    })
    parser.parseString(fileString, function (e, r) {
        fileWebConfig = r
        return r
    })

    const builder = new Builder()
    const xml = builder.buildObject({...originalWebConfig, ...fileWebConfig })
    return xml;
}
