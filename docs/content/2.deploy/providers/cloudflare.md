# Cloudflare

Deploy Nitro apps to CloudFlare.

## Cloudflare Workers

**Preset:** `cloudflare` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="info"}
**Note:** This preset uses [service-worker syntax](https://developers.cloudflare.com/workers/learning/service-worker/) for deployment.
::

::alert{type="warning"}
**Warning:** Please be aware that `runtimeConfig` cannot be updated via Cloudflare's environment variables (see [#272](https://github.com/unjs/nitro/issues/272) for more). As a workaround, you can use the Cloudflare env variables as constants in the code.
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

Install [wrangler2](https://github.com/cloudflare/wrangler2) and login to your Cloudflare account:

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
wrangler publish
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

Publish:

```bash
wrangler pages publish
```

## Cloudflare Module Workers

**Preset:** `cloudflare-module` ([switch to this preset](/deploy/#changing-the-deployment-preset))

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
cloudflare.context.waitUntil(logRequest(event.node.req))
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

