# IIS

Deploy Nitro apps to IIS. You can either use [IISnode](https://github.com/Azure/iisnode) (recommended for Nuxt) or IIS directly.

Make sure that [node.js](https://nodejs.org/en/) is installed on your Windows Server.

**Preset:** `iisnode` ([switch to this preset](/deploy/#changing-the-deployment-preset))

IISnode supports SSR build, but requires configuration

Install [IISnode x64](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x64.msi) or [IISnode x86](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x86.msi), and the [IIS URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite).

Deploy the contents of your `.output` folder to your website in IIS.

In IIS, add `.mjs` as a new mime type and set its content type to `application/javascript`.

## Using IIS directly

**Preset:** `iis` ([switch to this preset](/deploy/#changing-the-deployment-preset))

If you do not wish to use IISnode, you can use IIS directly.
To deploy a Nitro application to IIS, the `HttpPlatformHandler` IIS Module is needed.

Copy your `.output` directory into the Windows Server, and create a website on IIS pointing to that exact directory.