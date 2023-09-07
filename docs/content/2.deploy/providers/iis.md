# IIS

Deploy Nitro apps to IIS.

::alert{type="warning"}
This is an experimental preset.
::

## Using [IISnode](https://github.com/Azure/iisnode) (recommended)

**Preset:** `iis_node` ([switch to this preset](/deploy/#changing-the-deployment-preset))

1. Install [IISnode](https://github.com/azure/iisnode/releases), and the [IIS URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite).
2. In IIS, add `.mjs` as a new mime type and set its content type to `application/javascript`.
3. Deploy the contents of your `.output` folder to your website in IIS.

## Using IIS directly

**Preset:** `iis-handler` ([switch to this preset](/deploy/#changing-the-deployment-preset))

If you do not wish to use IISnode, you can use IIS directly.

1. Make sure that [Node.js](https://nodejs.org/en/) is installed on your Windows Server.
2. Make sure [`HttpPlatformHandler` Module](https://www.iis.net/downloads/microsoft/httpplatformhandler) is installed.
3. Copy your `.output` directory into the Windows Server, and create a website on IIS pointing to that exact directory.

## IIS Config options

::code-group

```ts [nitro.config.ts]
export default defineNitroConfig({
  // IIS options default
  iis: {
    // merges in a pre-exisiting web.config file to the nitro default file
    mergeConfig: true,
    // overrides the default nitro web.config file all together
    overrideConfig: false,
  },
});
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    // IIS options default
    iis: {
      // merges in a pre-exisiting web.config file to the nitro default file
      mergeConfig: true,
      // overrides the default nitro web.config file all together
      overrideConfig: false,
    },
  },
});
```

::
