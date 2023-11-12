# Render.com

Deploy Nitro apps to Render.

**Preset:** `render_com` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying on [Render](https://render.com/) with minimal configuration.

## Set up application

1. [Create a new Web Service](https://dashboard.render.com/select-repo?type=web) and select the repository that contains your code.

1. Ensure the 'Node' environment is selected.

1. Depending on your package manager, set the build command to `yarn && yarn build`, `npm install && npm run build`, or `pnpm i --shamefully-hoist && pnpm build`.

1. Update the start command to `node .output/server/index.mjs`

1. Click 'Advanced' and add an environment variable with `NITRO_PRESET` set to `render_com`. You may also need to add a `NODE_VERSION` environment variable set to `18` for the build to succeed ([docs](https://render.com/docs/node-version)).

1. Click 'Create Web Service'.

## Infrastructure as Code (IaC)

1. Create a file called `render.yaml` with following content at the root of your repository.
> This file followed by [Infrastructure as Code](https://render.com/docs/infrastructure-as-code) on Render

```yaml
services:
  - type: web
    name: <PROJECTNAME>
    env: node
    branch: main
    startCommand: node .output/server/index.mjs
    buildCommand: npm install && npm run build
    envVars:
    - key: NITRO_PRESET
      value: render_com
```
2. [Create a new Blueprint Instance](https://dashboard.render.com/select-repo?type=blueprint) and select the repository containing your `render.yaml` file.


You should be good to go!
