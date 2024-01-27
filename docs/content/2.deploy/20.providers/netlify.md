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

::alert{type="note"}
Make sure the publish directory is set to `dist` when creating a new project.
::

## Netlify Edge Functions

**Preset:** `netlify_edge` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Netlify Edge Functions use Deno and the powerful V8 JavaScript runtime to let you run globally distributed functions for the fastest possible response times. ([Read More](https://www.netlify.com/blog/announcing-serverless-compute-with-edge-functions))

Nitro output can directly run the server at the edge. Closer to your users.

::alert{type="note"}
Make sure the publish directory is set to `dist` when creating a new project.
::

## On-demand Builders

**Preset:** `netlify_builder` ([switch to this preset](/deploy/#changing-the-deployment-preset))

On-demand Builders are serverless functions used to generate web content as needed that’s automatically cached on Netlify’s Edge CDN. They enable you to build pages for your site when a user visits them for the first time and then cache them at the edge for subsequent visits.  ([Read More](https://docs.netlify.com/configure-builds/on-demand-builders/))
