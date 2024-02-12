# Deno Deploy

Deploy Nitro apps to [Deno Deploy](https://deno.com/deploy).

**Preset:** `deno_deploy` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="warning"}
Deno deploy preset is experimental.
::

## Deploy with the CLI

You can use [deployctl](https://deno.com/deploy/docs/deployctl) to deploy your app.

Login to [Deno Deploy](https://dash.deno.com/account#access-tokens) to obtain a `DENO_DEPLOY_TOKEN` access token, and set it as an environment variable.

```bash
# Build with the deno_deploy NITRO preset
NITRO_PRESET=deno_deploy npm run build

# Make sure to run the deployctl command from the output directory
cd .output
deployctl deploy --project=my-project server/index.ts
```

## Deploy within CI/CD using GitHub Actions

You just need to include the deployctl GitHub Action as a step in your workflow.

You do not need to set up any secrets for this to work. You do need to link your GitHub repository to your Deno Deploy project and choose the "GitHub Actions" deployment mode. You can do this in your project settings on https://dash.deno.com.

Create `.github/workflows/deno_deploy.yml`:

```yaml
name: deno-deploy

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    steps:
      - uses: actions/checkout@v3
      - run: corepack enable
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install
      - run: pnpm build
        env:
          NITRO_PRESET: deno_deploy
      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: my-project
          entrypoint: server/index.ts
          root: .output
```
