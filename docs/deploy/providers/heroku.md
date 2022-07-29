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
1. Add `start` and `heroku-postbuild` commands to `package.json` file.

   ```
   "scripts": {
      "start": "node .output/server/index.mjs"
   }
   ```
