# Vercel

Deploy Nitro apps to Vercel.

**Preset:** `vercel` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert
**Zero Config Provider**
:br
Integration with this provider is possible with zero configuration. ([Learn More](/deploy/#zero-config-providers))
::

## Deploy using Git

1. Push your code to your git repository (GitHub, GitLab, Bitbucket).
2. [Import your project](https://vercel.com/new) into Vercel.
3. Vercel will detect that you are using Nitro and will enable the correct settings for your deployment.
4. Your application is deployed!

After your project has been imported and deployed, all subsequent pushes to branches will generate [Preview Deployments](https://vercel.com/docs/concepts/deployments/environments#preview), and all changes made to the Production Branch (commonly “main”) will result in a [Production Deployment](https://vercel.com/docs/concepts/deployments/environments#production).

Learn more about Vercel’s [Git Integration](https://vercel.com/docs/concepts/git).

## Vercel Edge Functions

**Preset:** `vercel-edge` ([switch to this preset](/deploy/#changing-the-deployment-preset))

It is possible to deploy your nitro applications directly on [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions).

> Vercel Edge Functions allow you to deliver content to your site's visitors with speed and personalization.
> They are deployed globally by default on Vercel's Edge Network and enable you to move server-side logic to the Edge, close to your visitor's origin.
> Edge Functions use the Vercel Edge Runtime, which is built on the same high-performance V8 JavaScript and WebAssembly engine that is used by the Chrome browser.
> By taking advantage of this small runtime, Edge Functions can have faster cold boots and higher scalability than Serverless Functions.
> Edge Functions run after the cache, and can both cache and return responses. [Read More](https://vercel.com/docs/concepts/functions/edge-functions)

In order to enable this target, please set `NITRO_PRESET` environment variable to `vercel-edge`.

## Vercel KV Storage

You can easily use [Vercel KV Storage](https://vercel.com/docs/storage/vercel-kv) with [Nitro Storage](/guide/storage).

::alert{type="warning"}
This feature is currently in beta. Please check [driver docs](https://unstorage.unjs.io/drivers/vercel-kv).
::

1. Install `@vercel/kv` dependency:

```json [package.json]
{
  "devDependencies": {
    "@vercel/kv": "latest"
  }
}
```

Update your configuration:

::code-group
```ts [nitro.config.ts]
import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  storage: {
    data: { driver: 'vercelKV' }
  }
})
```
```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    storage: {
      data: { driver: 'vercelKV' }
    }
  }
})
```
::

::alert
You need to either set `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables or pass `url` and `token` to driver options. Check [driver docs](https://unstorage.unjs.io/drivers/vercel-kv) for more information about usage.
::

You can now access data store in any event handler:

```ts
export default eventHandler(async (event) => {
  const dataStorage = useStorage("data");
  await dataStorage.setItem("hello", "world");
  return {
    hello: await dataStorage.getItem("hello"),
  };
});
```

## Custom Build Output Configuration

You can provide additional [build output configuration](https://vercel.com/docs/build-output-api/v3) using `vercel.config` key inside `nitro.config`. It will be merged with built-in auto generated config.
