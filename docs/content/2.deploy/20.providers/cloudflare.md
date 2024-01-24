# Cloudflare

Deploy Nitro apps to CloudFlare.

## Cloudflare Pages

**Preset:** `cloudflare_pages` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert
**Note:** This is the recommended preset for Cloudflare deployments, please consider using the alternative ones only if you have special requirements or needs.
::

::alert
**Zero Config Provider**
:br
Integration with this provider is possible with zero configuration. ([Learn More](/deploy/#zero-config-providers))
::

Nitro automatically generates a `_routes.json` file that controls which routes get served from files and which are served from the Worker script. The auto-generated routes file can be overridden with the config option `cloudflare.pages.routes` ([read more](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes)).

### Building your Application using the preset

The preset only applies for the application build process.

If you use the [Cloudflare Pages GitHub/GitLab integration](https://developers.cloudflare.com/pages/get-started/#connect-your-git-provider-to-pages), and you don't need to preview your application locally, Nitro does not require any type of configuration. When you push to your repository, the Cloudflare Pages CI/CD process will automatically build your project and Nitro will detect the correct environment and build your application accordingly.

If instead you want preview your application locally and/or manually deploy it, when building the application you will need to let Nitro know that the target environment is the Cloudflare Pages one, you can do that in two ways:

1. By defining either the `NITRO_PRESET` or the `SERVER_PRESET` environment variable set to `cloudflare-pages` when running the build process, like so:
```bash
NITRO_PRESET=cloudflare-pages npm run build
```

1. Or by updating your Nitro [preset configuration](/config#preset):
```json5
"preset": "cloudflare-pages",
```
and then running the standard build command:
```bash
npm run build
```

### Wrangler

To preview your application locally or manually deploy it you will need to use the [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) CLI tool, simply install it as a node dependency:

```bash
npm i wrangler
```

### Preview your app locally

After having built your application you can preview it locally with wrangler by running:

```bash
npx wrangler pages dev dist
```

### Deploy your app locally

After having built your application you can manually deploy it with wrangler, in order to do so first make sure to be
logged into your Cloudflare account:

```bash
npx wrangler login
```

Then you can deploy the application with:

```bash
npx wrangler pages deploy dist
```

## Cloudflare Module Workers

**Preset:** `cloudflare_module` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="info"}
**Note:** This preset uses the [module worker syntax](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/) for deployment.
::

::alert{type="warning"}
**Note:** Using this preset is not recommended.
::

When using Workers you will need a `wrangler.toml` file, in your root directory.

The following shows a typical `wrangler.toml` file for a Nitro application:

```ini
name = "playground"
main = "./.output/server/index.mjs"
workers_dev = true
compatibility_date = "2023-12-01"
# account_id = "<(optional) your Cloudflare account id, retrievable from the Cloudflare dashboard>"
# route = "<(optional) mainly useful when you want to setup custom domains>"

rules = [
  { type = "ESModule", globs = ["**/*.js", "**/*.mjs"]},
]

[site]
bucket = ".output/public"
```

### Preview your app locally

You can use [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler), to preview your app locally:

```bash
NITRO_PRESET=cloudflare npm run build

# If you have added a 'wrangler.toml' file like above in the root of your project:
npx wrangler dev

# If you don't have a 'wrangler.toml', directly use:
npx wrangler dev .output/server/index.mjs --site .output/public
```

### Deploy from your local machine using wrangler

Install [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) and login to your Cloudflare account:

```bash
npm i wrangler
wrangler login
```

Generate your app using the `cloudflare` preset:

```bash
NITRO_PRESET=cloudflare_module npm run build
```

You can then preview it locally:

```bash
# If you have a 'wrangler.toml' like above:
npx wrangler dev

# If you don't have a 'wrangler.toml':
npx wrangler dev .output/server/index.mjs --site .output/public
```

and publish it:

```bash
npx wrangler deploy
```

## Cloudflare Service Workers

**Preset:** `cloudflare` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="info"}
**Note:** This preset uses the [service worker syntax](https://developers.cloudflare.com/workers/learning/service-worker/) for deployment.
::

::alert{type="warning"}
**Note:** This preset is deprecated.
::

The way this preset works is identical to that of the `cloudflare_module` one presented above, with the only difference being that such preset inherits all the [disadvantages](https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/#advantages-of-migrating) that such syntax brings.

## Deploy within CI/CD using GitHub Actions

Regardless on whether you're using Cloudflare Pages or Cloudflare workers, you can use the [Wrangler GitHub actions](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) to deploy your application.

::alert{type="info"}
**Note:** Remember to [instruct Nitro to use the correct preset](/deploy/#changing-the-deployment-preset) (note that this is necessary for all presets including the `cloudflare_pages` one).
::

## Environment Variables

Nitro allows you to universally access environment variables using `process.env` or `import.meta.env` or the runtime config.

::alert
Make sure to only access environment variables **within the event lifecycle**  and not in global contexts since Cloudflare only makes them available during the request lifecycle and not before.
::

**Example:** If you have set the `SECRET` and `NITRO_HELLO_THERE` environment variables set you can access them in the following way:

```ts
console.log(process.env.SECRET) // note that this is in the global scope! so it doesn't actually work and the variable is undefined!

export default defineEventHandler((event) => {
  // note that all the below are valid ways of accessing the above mentioned variables
  useRuntimeConfig(event).helloThere
  useRuntimeConfig(event).secret
  process.env.NITRO_HELLO_THERE
  import.meta.env.SECRET
});
```

### Specify Variables in Development Mode

For development, you can use a `.env` file to specify environment variables:

```ini
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

::alert{type="info"}
**Note:** Make sure you add `.env` to the `.gitignore` file so that you don't commit it as it can contain sensitive information.
::


### Specify Variables for local previews

After build, when you try out your project locally with `wrangler dev` or `wrangler pages dev`, in order to have access to environment variables you will need to specify the in a `.dev.vars` file in the root of your project (as presented in the [Pages](https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally) and [Workers](https://developers.cloudflare.com/workers/configuration/environment-variables/#interact-with-environment-variables-locally) documentation).

If you are using a `.env` file while developing, your `.dev.vars` should be identical to it.

::alert{type="info"}
**Note:** Make sure you add `.dev.vars` to the `.gitignore` file so that you don't commit it as it can contain sensitive information.
::


### Specify Variables for Production

For production, use the cloudflare dashboard or the [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) command to set environment variables and secrets.

### Specify Variables using `wrangler.toml`

You can specify a custom `wrangler.toml` file and define vars inside.

::alert{type="info"}
**Note:** `wrangler.toml` isn't supported by cloudflare pages.
::

::alert{type="warning"}
Note that this isn't recommend for sensitive data.
::

**Example:**

```ini [wrangler.toml]
# Shared
[vars]
NITRO_HELLO_THERE="general"
SECRET="secret"

# Override values for `--env production` usage
[env.production.vars]
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

## Cloudflare Bindings

Bindings are what allows you to interact with resources from the Cloudflare platform, examples of such resources are key-value data storages ([KVs](https://developers.cloudflare.com/kv/)) and serverless SQL databases ([D1s](https://developers.cloudflare.com/d1/)).

For more details on Bindings and how to use them please refer to the Cloudflare [Pages](https://developers.cloudflare.com/pages/functions/bindings/) and [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) documentation.

In your Nitro app you can access Cloudflare bindings from the request event, by accessing its `context.cloudflare.env` field, this is for example how you can access a D1 bindings:

```ts
const { cloudflare } = event.context
const stmt = await cloudflare.env.MY_D1.prepare('SELECT id FROM table')
const { results } = await stmt.all()
```

::alert{type="warning"}
Note that bindings cannot be accessed during dev mode, they will be available only when you preview your Nitro app through `wrangler` or in the production deployment, and in both cases they need to be properly configured (as presented in the Cloudflare [Pages](https://developers.cloudflare.com/pages/functions/bindings/) and [Workers](https://developers.cloudflare.com/workers/configuration/bindings/#bindings) documentation).
::
