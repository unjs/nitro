---
title: Layer0
description: "Discover Layer0 preset for Nitro!"
---

**Preset:** `layer0` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro provides a built-in preset to generate output format compatible with [Layer0](https://www.layer0.co/).

Layer0 extends the capabilities of a traditional CDN by not only hosting your static content, but also providing server-side rendering for progressive web applications as well as caching both your APIs and HTML at the network edge to provide your users with the fastest browsing experience.

If this is your first time deploying to Layer0, the interactive CLI as part of the `deploy` command will prompt to authenticate using your browser. You may also [sign up](https://app.layer0.co/signup) prior to deployment.

## Testing locally

You can use Layer0 to test your app locally:

```bash
NITRO_PRESET=layer0 yarn build

# .output/server directory
npm install && 0 build && 0 run -p
```

## Deploying from your local machine

Once you have tested your application locally, you may deploy using:

```bash
# .output/server directory
npm install && 0 deploy
```

It is recommended you install Layer0's CLI globally on your machine for a more seamless integration:

```bash
npm i -g @layer0/cli@latest
```

## Deploying using CI/CD

If you are deploying from a non-interactive environment, you will need to create an account on [Layer0 Developer Console](https://app.layer0.co) first and setup a [deploy token](https://docs.layer0.co/guides/deploy_apps#section_deploy_from_ci). Once the deploy token is created, save it as a secret to your environment. You can start the deploy by running:

```bash
0 deploy --token=XXX
```
