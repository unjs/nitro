# Flightcontrol

**Preset:** `flightcontrol` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying to [AWS via Flightcontrol](https://flightcontrol.dev?ref=nitro) with minimal configuration.

::alert
Flightcontrol has zero config support for [Nuxt](https://nuxt.com/) projects.
::

### Set Up your Flightcontrol account

On a high level, the steps you will need to follow to deploy a project for the first time are:

1. Create an account at [Flightcontrol](https://app.flightcontrol.dev/signup?ref=nitro)
2. Create an account at [AWS](https://portal.aws.amazon.com/billing/signup) (if you don't already have one)
3. Link your AWS account to the Flightcontrol
4. Authorize the Flightcontrol GitHub App to access your chosen repositories, public or private.
5. Create a Flightcontrol project with configuration via the Dashboard or with configuration via `flightcontrol.json`.

### Create a Project with Configuration via the Dashboard

1. Create a Flightcontrol project from the Dashboard. Select a repository for the source.
2. Select the `GUI` config type.
3. Select the Nuxt preset. This preset will also work for any Nitro-based applications.
4. Select your preferred AWS server size.
5. Submit the new project form.

### Create a Project with Configuration via `flightcontrol.json`

1. Create a Flightcontrol project from your dashboard. Select a repository for the source.
2. Select the `flightcontrol.json` config type.
3. Add a new file at the root of your repository called `flightcontrol.json`. Here is an example configuration that creates an AWS fargate service for your app:

```json
{
  "$schema": "https://app.flightcontrol.dev/schema.json",
  "environments": [
    {
      "id": "production",
      "name": "Production",
      "region": "us-west-2",
      "source": {
        "branch": "main"
      },
      "services": [
        {
          "id": "nitro",
          "buildType": "nixpacks",
          "name": "My Nitro site",
          "type": "fargate",
          "domain": "www.yourdomain.com",
          "outputDirectory": ".output",
          "startCommand": "node .output/server/index.mjs",
          "cpu": 0.25,
          "memory": 0.5
        }
      ]
    }
  ]
}
```

4. Submit the new project form.

Learn more about Flightcontrol's [configuration](https://www.flightcontrol.dev/docs?ref=nitro).
