# Edgio

Deploy Nitro apps to Edgio (formerly Layer0).

**Preset:** `edgio` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro provides a built-in preset to generate output format compatible with [Edgio (formerly Layer0)](https://edg.io/).

Edgio (formerly Layer0) extends the capabilities of a traditional CDN by not only hosting your static content, but also providing server-side rendering for progressive web applications as well as caching both your APIs and HTML at the network edge to provide your users with the fastest browsing experience.

If this is your first time deploying to Edgio, the interactive CLI as part of the `deploy` command will prompt to authenticate using your browser. You may also [sign up](https://app.layer0.co/signup) prior to deployment.

## Install the Edgio CLI

```bash
npm i -g @edgio/cli
```

## Testing production build locally with Edgio

You can use Nitropack to test your app's developement experience locally:

```bash
NITRO_PRESET=edgio npx nitropack build
```

To simulate on local how your app would run in production with Edgio, run the following command:

```bash
edgio build && edgio run --production
```

## Deploying from your local machine

Once you have tested your application locally, you may deploy using:

```bash
edgio deploy
```

## Deploying using CI/CD

If you are deploying from a non-interactive environment, you will need to create an account on [Edgio Developer Console](https://app.layer0.co) first and setup a [deploy token](https://docs.edg.io/guides/basics/deployments#deploy-from-ci). Once the deploy token is created, save it as a secret to your environment. You can start the deploy by running:

```bash
edgio deploy --token=XXX
```
