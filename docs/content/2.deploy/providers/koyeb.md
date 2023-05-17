# Koyeb

Deploy Nitro apps to Koyeb.

**Preset:** `koyeb` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying on [Koyeb](https://www.koyeb.com/) with minimal configuration.

## Using the Control Panel

1. In the [Koyeb control panel](https://app.koyeb.com/), click **Create App**.

1. Choose **GitHub** as your deployment method.

1. Choose the GitHub **repository** and **branch** containing your application code.

1. Name your Service, for example `nuxt-service`.

1. Under the **Build and deployment settings**, toggle the override switch associated with the run command field.  In the **Run command** field, enter:

   ```
   node .output/server/index.mjs`
   ```

1. In the **Advanced** section, click **Add Variable** and add a `NITRO_PRESET` variable set to `koyeb`.

1. Name the App, for example `example-nuxt`.

1. Click the **Deploy** button.

## Using the Koyeb CLI

1. Follow the instructions targeting your operating system to [install the Koyeb CLI client](https://www.koyeb.com/docs/cli/installation) with an installer.  Alternatively, visit the [releases page on GitHub](https://github.com/koyeb/koyeb-cli/releases) to directly download required files.

1. Create a Koyeb API access token by visiting the [API settings for your organization](https://app.koyeb.com/settings/api) in the Koyeb control panel.

1. Log into your account with the Koyeb CLI by typing:

   ```
   koyeb login
   ```

   Paste your API credentials when prompted.

1. Deploy your Nitro application from a GitHub repository with the following command.  Be sure to substitute your own values for `<APPLICATION_NAME>`, `<YOUR_GITHUB_USERNAME>`, and `<YOUR_REPOSITORY_NAME>`:

   ```
   koyeb app init <APPLICATION_NAME> \
     --git github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME> \
     --git-branch main \
     --ports 3000:http \
     --routes /:3000 \
     --env PORT=3000 \
     --env NITRO_PRESET=koyeb
   ```
