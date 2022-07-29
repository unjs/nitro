# Heroku

**Preset:** `heroku` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying on [Heroku](https://heroku.com/) with minimal configuration.

## Using the Heroku CLI

1. Create a new Heroku app.

   ```bash
   heroku create myapp
   ```

1. Configure Heroku to use the nodejs buildpack.

   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

1. Configure your app.

   ```bash
   heroku config:set NITRO_PRESET=heroku
   ```
   
1. Configure your app.

   ```bash
   heroku config:set NITRO_PRESET=heroku
   ```
   
1. Configure your app.

   ```bash
   heroku config:set HOST=0.0.0.0
   ```

## Update your config

In order to run Nuxt 3 on Heroku, you need to update the following packages.

1. Add to `nuxt.config.ts` file the `nitro` preset.

   ```
   import { defineNuxtConfig } from 'nuxt';

   // https://v3.nuxtjs.org/api/configuration/nuxt.config
   export default defineNuxtConfig({
     nitro: {
       preset: 'node-server',
     },
   });
   ```
1. Add `start` and `heroku-postbuild` commands to `package.json` file.

   ```
   "scripts": {
      "heroku-postbuild": "npm run build",
      "start": "nuxt preview"
   }
   ```
1. Move the `nuxt` package from `devDependencies` to `dependencies` or Heroku won't be able to run command `npm start` because it runs under the `PRODUCTION` environment.

   ```
   "dependencies": {
      "nuxt": "3.0.0-rc.6"
   }
   ```
