import { resolve } from "pathe";
import { writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

const iisnodeXmlTemplate = () => `
<?xml version="1.0" encoding="utf-8"?>
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

const iisXmlTemplate = () => `
<?xml version="1.0" encoding="UTF-8"?>
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

// iisnode
export const iisnode = defineNitroPreset({
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

// iis directly
export const iis = defineNitroPreset({
  extends: "node-server",
  hooks: {
    async compiled(nitro: Nitro) {
      await writeFile(
        resolve(nitro.options.output.dir, "web.config"),
        iisXmlTemplate()
      );
    },
  },
});
