# DigitalOcean

**Preset:** `digitalocean` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying on the [Digital Ocean App Platform](https://docs.digitalocean.com/products/app-platform/) with minimal configuration.

## Set up application

1. Create a new Digital Ocean app following the [guide](https://docs.digitalocean.com/products/app-platform/how-to/create-apps/).

1. Next, you'll need to configure environment variables. In your app settings, ensure the following app-level environment variables are set:

   ```bash
   HOST=0.0.0.0
   NITRO_PRESET=digital-ocean
   ```

   [More information](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/).

You can now follow [the rest of the Digital Ocean deployment guide](https://docs.digitalocean.com/products/app-platform/how-to/manage-deployments/).
