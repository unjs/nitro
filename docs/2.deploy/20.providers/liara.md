# Liara

> Deploy Nitro apps to Liara.

**Preset:** `liara`

:read-more{title="Liara.ir" to="https://docs.liara.ir/paas/nodejs/related-apps/nitro/"}

## Using the Liara CLI

1. Install Liara CLI
   ```bash
   npm install -g @liara/cli
   ```

1. Login to Liara

   ```bash
   liara login # npx liara login
   ```

1. Create a nodeJS app

   ```bash
   liara create # npx liara create
   ```
   
1. Deploy your app

   ```bash
   liara deploy --port 3000 --platform node # npx liara deploy --port 3000 --platform node
   ```

1. Ensure you have `start` and `build` commands in your `package.json` file. for example:

   ```json5
   "scripts": {
     "build": "nitro build", // or `nuxt build` if using nuxt
     "start": "node .output/server/index.mjs"
   }
   ```
