---
title: Edgio
description: 'Discover Edgio preset for Nitro!'
---

**Preset:** `edgio` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro provides a built-in preset to generate output format compatible with [Edgio](https://edg.io/).

Edgio extends the capabilities of a traditional CDN by not only hosting your static content, but also providing server-side rendering for progressive web applications as well as caching both your APIs and HTML at the network edge to provide your users with the fastest browsing experience.

If this is your first time deploying to Edgio, the interactive CLI as part of the `deploy` command will prompt to authenticate using your browser. You may also [sign up](https://app.layer0.co/signup) prior to deployment.

## Testing locally

You can use Edgio to test your app locally:

```bash
NITRO_PRESET=edgio yarn build

# .output/server directory
npm install && edgio build && edgio run -p
```

## Deploying from your local machine

Once you have tested your application locally, you may deploy using:

```bash
# .output/server directory
npm install && edgio deploy
```

It is recommended you install Edgio's CLI globally on your machine for a more seamless integration:

```bash
npm i -g @edgio/cli@latest
```

## Deploying using CI/CD

If you are deploying from a non-interactive environment, you will need to create an account on [Edgio Developer Console](https://app.layer0.co) first and setup a [deploy token](https://docs.edg.io/guides/deploy_apps#section_deploy_from_ci). Once the deploy token is created, save it as a secret to your environment. You can start the deploy by running:

```bash
edgio deploy --token=XXX
```
