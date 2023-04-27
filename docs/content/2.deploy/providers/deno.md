# Deno

Deploy Nitro apps to Deno Deploy.

## Deno Deploy

**Preset:** `deno` ([switch to this preset](/deploy/#changing-the-deployment-preset))

### Deploy with the CLI

You can use [deployctl](https://deno.com/deploy/docs/deployctl) to deploy your app.

Login to [Deno Deploy](https://dash.deno.com/account#access-tokens) to obtain a `DENO_DEPLOY_TOKEN` access token, and set it as an environment variable.

```bash
# Build with the deno NITRO preset
NITRO_PRESET=deno yarn build

# Make sure to run the deployctl command from the output directory
cd .output && deployctl deploy --project=my-project server/index.ts
```

### Deploy within CI/CD using GitHub Actions

You just need to include the deployctl GitHub Action as a step in your workflow.

You do not need to set up any secrets for this to work. You do need to link your GitHub repository to your Deno Deploy project and choose the "GitHub Actions" deployment mode. You can do this in your project settings on https://dash.deno.com.


Create `.github/workflows/deno.yml`:

```yaml
name: deno

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
          NITRO_PRESET: deno

      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: my-project
          entrypoint: server/index.ts
          root: .output
```