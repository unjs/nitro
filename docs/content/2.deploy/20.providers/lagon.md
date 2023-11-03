# Lagon

Deploy Nitro apps to Lagon.

**Preset:** `lagon` ([switch to this preset](/deploy/#changing-the-deployment-preset))

[Lagon](https://lagon.app/) is an open-source runtime and platform that allows developers to run TypeScript and JavaScript Serverless Functions close to users.

Nitro supports deploying on [Lagon](https://lagon.app/) with minimal configuration ([documentation](https://docs.lagon.app/))

::alert{type="warning"}
Lagon is not yet ready for production workloads
::


### Testing locally

1. Build your Nitro app with `NITRO_PRESET=lagon`

2. Install [Lagon CLI](https://docs.lagon.app/cli#installation)

3. Launch a local dev server (this will pick the config in `.output/.lagon/config.json`) and open [localhost:1234](http://localhost:1234):

```bash
lagon dev ./.output
```

(this is equivalent to `lagon dev ./.output/server/index.mjs -p ./.output/public`)

### Deploy from your local machine

1. Build your Nitro app with `NITRO_PRESET=lagon`

2. Install [Lagon CLI](https://docs.lagon.app/cli#installation) and login with `lagon login`

3. Run the deploy command. Lagon will ask if you want to link to an existing function or create a new one:

```bash
lagon deploy .output
```

(this is equivalent to `lagon deploy ./.output/server/index.mjs -p ./.output/public`)

4. To trigger a new deployment, run the same command and append `--prod` if you want to deploy to production:

Deploy to preview:

```bash
lagon deploy .output
```

Deploy to production:

```bash
lagon deploy .output --prod
```

### Deploy within CI/CD using GitHub Actions

Add a new environment variable named `LAGON_TOKEN`, and copy the value from the [Tokens section of Lagon's dashboard](https://dash.lagon.app/profile).

Create a new GitHub Workflow at `.github/workflows/lagon.yml`:

```yaml
name: Lagon

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install
      - run: pnpm build
        env:
          NITRO_PRESET: lagon
      - uses: lagonapp/github-action@latest
        with:
          lagon_token: ${{ secrets.LAGON_TOKEN }}
```

#### If you have committed the `.lagon` folder

Trigger a deployment locally first, and commit the updated `.lagon/config.json` file. The GitHub Action will automatically pick the configuration file.

#### If you haven't committed the `.lagon` folder

Trigger a deployment locally first, and copy the content of `.lagon/config.json`. Then, update the workflow configuration:

```yaml
with:
  lagon_token: ${{ secrets.LAGON_TOKEN }}
  config: |
    {
      "function_id": "${{ vars.lagon_function_id }}",
      "organization_id": "${{ vars.lagon_org_id }}",
      "index": ".output/index.mjs",
      "client": null,
      "assets": ".output/public"
    }
```
