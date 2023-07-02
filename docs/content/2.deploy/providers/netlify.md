# Netlify

Deploy Nitro apps to Netlify.

**Preset:** `netlify` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert
**Zero Config Provider**
:br
Integration with this provider is possible with zero configuration. ([Learn More](/deploy/#zero-config-providers))
::

Normally, the deployment to Netlify does not require any configuration.
Nitro will auto-detect that you are in a [Netlify](https://www.netlify.com) build environment and build the correct version of your server.

For new sites, Netlify will detect that you are using Nitro and set the publish directory to `dist` and build command to `npm run build`.

If you are upgrading an existing site you should check these and update them if needed.

If you want to add custom redirects, you can do so with [`routeRules`](/config#routerules) or by adding a [`_redirects`](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file) file to your `public` directory.

For deployment, just push to your git repository [as you would normally do for Netlify](https://docs.netlify.com/configure-builds/get-started/).

## Netlify Edge Functions

**Preset:** `netlify-edge` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Netlify Edge Functions use Deno and the powerful V8 JavaScript runtime to let you run globally distributed functions for the fastest possible response times. ([Read More](https://www.netlify.com/blog/announcing-serverless-compute-with-edge-functions))

Nitro output can directly run the server at the edge. Closer to your users.

## On-demand Builders

**Preset:** `netlify-builder` ([switch to this preset](/deploy/#changing-the-deployment-preset))

On-demand Builders are serverless functions used to generate web content as needed that’s automatically cached on Netlify’s Edge CDN. They enable you to build pages for your site when a user visits them for the first time and then cache them at the edge for subsequent visits.  ([Read More](https://docs.netlify.com/configure-builds/on-demand-builders/))

## Handling atomic deploys with Nuxt

[`cdnURL`](https://nuxt.com/docs/api/configuration/nuxt-config#cdnurl) can be used to configure the URL which serves the public folder from.

Since Netlify uses atomic deploys, old chunk files will become invalid when a deploy occurs.
By default, Nuxt will reload the page in some circumstances, which causes errors when existing clients try to load chunk files which no longer exist.
It's possible to configure Nuxt to serve Netlify's permanent link to each deploy.

Add this to your `nuxt.config.ts` :

```ts
export default defineNuxtConfig({
    $production: {
        app: {
            cdnURL: '/netlify/' + process.env.DEPLOY_URL?.replace('https://', ''),
        },
        routeRules: {
            '/_nuxt/**': {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
                }
            }
        }
}}) 
```

Then use a `_redirects` file in your `public` directory :

```bash
/netlify/* https://:splat 200!
```

Security software (such as Streamline3) will block scripts served from a different domain, hence why proxying is necessary.

For example, with a `https://example.com` custom domain, and a `example.netlify.app` Netlify account,
`process.env.DEPLOY_URL` will be set to something like `https://5b243e66dd6a547b4fee73ae--example.netlify.app`.

Setting the `cdnURL` above will cause Nuxt to load scripts from `/netlify/5b243e66dd6a547b4fee73ae--example.netlify.app/*`

These URLs will then be [redirected](https://docs.netlify.com/routing/redirects/redirect-options/#splats) to the original `DEPLOY_URL`(`https://5b243e66dd6a547b4fee73ae--example.netlify.app`).
