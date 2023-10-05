# Cloudflare

Deploy Nitro apps to CloudFlare.

## Cloudflare Workers

**Preset:** `cloudflare` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="info"}
**Note:** This preset uses [service-worker syntax](https://developers.cloudflare.com/workers/learning/service-worker/) for deployment.
::

Login to your [Cloudflare Workers](https://workers.cloudflare.com) account and obtain your `account_id` from the sidebar.

Create a `wrangler.toml` in your root directory:

```ini
name = "playground"
main = "./.output/server/index.mjs"
workers_dev = true
compatibility_date = "2022-09-10"
account_id = "<the account_id you obtained (optional)>"
route = "<mainly useful when you want to setup custom domains (optional too)>"

[site]
bucket = ".output/public"
```

### Testing locally

You can use [wrangler2](https://github.com/cloudflare/wrangler2), to test your app locally:

```bash
NITRO_PRESET=cloudflare yarn build

# If you have added a 'wrangler.toml' file like above in the root of your project:
npx wrangler dev --local

# If you don't have a 'wrangler.toml', directly use:
npx wrangler dev .output/server/index.mjs --site .output/public --local
```

### Deploy from your local machine using wrangler

Install [wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler#quick-start) and login to your Cloudflare account:

```bash
npm i wrangler -g
wrangler login
```

Generate website with `cloudflare` preset:

```bash
NITRO_PRESET=cloudflare yarn build
```

You can preview locally:

```bash
# If you have a 'wrangler.toml' like above:
wrangler dev

# If you don't have a 'wrangler.toml':
wrangler dev .output/server/index.mjs --site .output/public
```

Publish:

```bash
wrangler deploy
```

### Deploy within CI/CD using GitHub Actions

Create a token according to [the wrangler action docs](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler#authentication) and set `CF_API_TOKEN` in your repository config on GitHub.

Create `.github/workflows/cloudflare.yml`:

```yaml
name: cloudflare

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  ci:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ ubuntu-latest ]
        node: [ 14 ]

    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node }}

      - name: Checkout
        uses: actions/checkout@master

      - name: Cache node_modules
        uses: actions/cache@v2
        with:
          path: node_modules
          key: ${{ matrix.os }}-node-v${{ matrix.node }}-deps-${{ hashFiles(format('{0}{1}', github.workspace, '/yarn.lock')) }}

      - name: Install Dependencies
        if: steps.cache.outputs.cache-hit != 'true'
        run: yarn

      - name: Build
        run: yarn build
        env:
          NITRO_PRESET: cloudflare

      - name: Publish to Cloudflare
        uses: cloudflare/wrangler-action@2.0.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

## Cloudflare Pages

**Preset:** `cloudflare_pages` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="warning"}
**Note:** This is an experimental preset.
::

::alert
**Zero Config Provider**
:br
Integration with this provider is possible with zero configuration. ([Learn More](/deploy/#zero-config-providers))
::

Nitro automatically generates a `_routes.json` file that controls which routes get served from files and which are served from the Worker script. The auto-generated routes file can be overridden with the config option `cloudflare.pages.routes` ([read more](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes)).

### Git integration

If you use the GitHub/GitLab [integration](https://developers.cloudflare.com/pages/get-started/#connect-your-git-provider-to-pages) with Pages, Nitro does not require any configuration. When you push to the repository, Pages will automatically build your project, and Nitro will detect the environment.

### Direct Upload

Alternatively, you can use [wrangler](https://github.com/cloudflare/wrangler2) to upload your project to Cloudflare. In this case, you will have to set the preset manually:

### Deploy from your local machine using wrangler

Install [wrangler](https://github.com/cloudflare/wrangler) and login to your Cloudflare account:

```bash
npm i wrangler -g
wrangler login
```

Create project:

```bash
wrangler pages project create <project-name>
```

Deploy:

```bash
wrangler pages deploy
```

## Cloudflare Module Workers

**Preset:** `cloudflare_module` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="warning"}
**Note:** This is an experimental preset.
::

::alert{type="info"}
**Note:** This preset uses [module syntax](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/) for deployment.
::

The module syntax allows you to use [Durable Objects](https://developers.cloudflare.com/workers/learning/using-durable-objects/), [D1](https://developers.cloudflare.com/d1/), and `waitUntil`. You can access the module bindings and context via `event.context.cloudflare`.

For example, with the following additions to your `wrangler.toml`:

```ini
services = [
  { binding = "WORKER", service = "<service name>" }
]
d1_databases = [
  { binding = "D1", database_id = "<database id>" }
]
```

### Using `waitUntil`

`waitUntil` allows cache writes, external logging, etc without blocking the event.

```ts
// waitUntil allows cache writes, external logging, etc without blocking the event
const { cloudflare } = event.context
cloudflare.context.waitUntil(logRequest(event.path))
```

### Access env and bindings

```js
const { cloudflare } = event.context
const res = await cloudflare.env.WORKER.fetch('<worker URL>')
```

### D1 usage

```ts
const { cloudflare } = event.context
const stmt = await cloudflare.env.D1.prepare('SELECT id FROM table')
const { results } = await stmt.all()
```

## Environment Variables

Nitro allows to universally access environment variables using `process.env` or `import.meta.env` or runtime config.

::alert
Make sure to only access environment variables **within the event lifecycle**  and not in global contexts since cloudflare only makes them available during the request lifecycle and not before.
::

**Example:** If you have set `SECRET` and `NITRO_HELLO_THERE` environment variables you can access them with either of these:

```ts
console.log(process.env.SECRET) // undefined (!)

export default defineEventHandler((event) => {
  // These are valid:
  useRuntimeConfig(event).helloThere
  useRuntimeConfig(event).secret
  process.env.NITRO_HELLO_THERE
  import.meta.env.SECRET
});
```

#### Specify Variables in Development Mode

For development, you can use a `.env` file to specify environment variables:

```ini
NITRO_HELLO_THERE="captain"
SECRET="top-secret"
```

::alert{type="info"}
**Note:** Make sure you add `.env` to the `.gitignore` file and do not commit it as it can contain sensitive information.
::


#### Specify Variables for Preview


After build, when you try out your project locally with `wrangler dev` or `wrangler pages dev`, use a `.dev.vars` file in the root of your project.

If you are using a `.env` file while developping, your `dev.vars` should be identical to it.

#### Specify Variables for Production

For production, use the cloudflare dashboard or the [`wrangler secret`](https://developers.cloudflare.com/workers/wrangler/commands/#secret) command to set environment variables and secrets.

#### Specify Variables using `wrangler.toml`

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

## Advanced

### Experimental Dynamic Imports

By default cloudflare presets output to a single bundle file.

In order to try experimental dynamic imports you need to set the `NITRO_EXP_CLOUDFLARE_DYNAMIC_IMPORTS` environment variable for build command.

::alert{type="warning"}
This is an experimental mode and is likely not working at the moment!
::

With `cloudflare_module` preset, you need to add the following rule to your `wrangler.toml` file:

```diff [wrangler.toml]
  name = "playground"
  main = "./.output/server/index.mjs"
  workers_dev = true
  compatibility_date = "2022-09-10"
  account_id = "<the account_id you obtained (optional)>"
  route = "<mainly useful when you want to setup custom domains (optional too)>"
+ rules = [
+   { type = "ESModule", globs = ["**/*.js", "**/*.mjs"]},
+ ]

  [site]
  bucket = ".output/public"
```

### Local Wrangler Dev builds

By default `wrangler dev` requires nitro to be built before it can be served by wrangler.

This can become tiresome if you're making changes to your nitro app and keep rebuilding to test changes in wrangler.

::alert{type="warning"}
This is a temporary workaround until nitro has better support for wrangler dev mode!
::

To instruct wrangler to automatically rebuild nitro when it detects file changes, you need to add the following rule to your `wrangler.toml` file:

```[wrangler.toml]
+ [env.development.build]
+ command = "NITRO_PRESET=cloudflare npm run build" // Replace npm with your packagemanager (npm, pnpm, yarn, bun)
+ cwd = "./"
+ watch_dir = ["./routes", "./nitro.config.ts"]
```

Now you need to run wrangler in development mode using `wrangler dev --env development`
When files change in nitro, wrangler will rebuild and serve the new files
