# Firebase

Deploy Nitro apps to Firebase.

**Preset:** `firebase` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports [Firebase Hosting](https://firebase.google.com/docs/hosting) with Cloud Functions out of the box.

**Note**: You need to be on the **Blaze plan** to use Nitro with Cloud Functions.

**Note**: This preset will deploy to firebase functions 1st gen by default. If you want to deploy to firebase functions 2nd gen, see the [instructions below](#using-2nd-generation-firebase-functions).

## Setup Using Nitro

If you don't already have a `firebase.json` in your root directory, Nitro will create one the first time you run it. In this file, you will need to replace `<your_project_id>` with the ID of your Firebase project. This file should then be committed to version control.

### Create a `.firebaserc` file

It is also recommended to create a `.firebaserc` file so you don't need to manually pass your project ID to your `firebase` commands (with `--project <your_project_id>`):

```json [.firebaserc]
{
  "projects": {
    "default": "<your_project_id>"
  }
}
```

This file is usually generated when you initialize your project with the Firebase CLI. But if you don't have one, you can create it manually.

### Install Firebase dependencies

Then, add Firebase dependencies to your project:

::code-group
```bash [npm]
npm install -D firebase-admin firebase-functions firebase-functions-test
```
```bash [yarn]
yarn add --dev firebase-admin firebase-functions firebase-functions-test
```
```bash [pnpm]
pnpm install -D firebase-admin firebase-functions firebase-functions-test
```
::

### Log into the firebase cli

Make sure you are authenticated with the firebase cli. Run this command and follow the prompts:

```bash
npx firebase-tools login
```

## Alternative Setup Using Firebase CLI (Recommended)

You may instead prefer to set up your project with the Firebase CLI, which will fetch your project ID for you, add required dependencies (see above) and even set up automated deployments via GitHub Actions (for hosting only). [Learn about installing the firebase CLI](https://firebase.google.com/docs/cli#windows-npm).

### Install Firebase CLI Globally

Always try to use the latest version of the Firebase CLI.

```bash
npm install -g firebase-tools@latest
```

**Note**: You need to be on [^11.18.0](https://github.com/firebase/firebase-tools/releases/tag/v11.18.0) to deploy a `nodejs18` function.

### Initialize your Firebase Project

```bash
firebase login
firebase init hosting
```

When prompted, you can enter `.output/public` as the public directory. In the next step, **do not** configure your project as a single-page app.

Once complete, add the following to your `firebase.json` to enable server rendering in Cloud Functions:

```json [firebase.json]
{
  "functions": { "source": ".output/server" },
  "hosting": [
    {
      "site": "<your_project_id>",
      "public": ".output/public",
      "cleanUrls": true,
      "rewrites": [{ "source": "**", "function": "server" }]
    }
  ]
}
```

You can find more details in the [Firebase documentation](https://firebase.google.com/docs/hosting/quickstart).

## Local Preview

You can preview a local version of your site if you need to test things out without deploying.

```bash
NITRO_PRESET=firebase npm run build
firebase emulators:start
```

## Build and Deploy

Deploy to Firebase Hosting by running a nitro build and then running the `firebase deploy` command.

```bash
NITRO_PRESET=firebase npm run build
```

```bash
npx firebase-tools deploy
```

If you installed the Firebase CLI globally, you can also run:

```bash
firebase deploy
```

## Using 2nd Generation Firebase Functions

- [Comparison between 1st and 2nd generation functions](https://firebase.google.com/docs/functions/version-comparison)

To switch to the more recent and, recommended generation of firebase functions, set the `firebase.gen` option to `2`:

::code-group
```ts{3} [nitro.config.ts]
export default defineNitroConfig({
  firebase: {
    gen: 2
    // ...
  }
})
```
```ts{4} [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    firebase: {
      gen: 2
      // ...
    }
  }
})
```
::

If you already have a deployed version of your website and want to upgrade to 2nd gen, [see the Migration process on Firebase docs](https://firebase.google.com/docs/functions/2nd-gen-upgrade). Namely, the CLI will ask you to delete your existing functions before deploying the new ones.

## Options

You can set options for the firebase functions in your `nitro.config.ts` file:

::code-group
```ts [nitro.config.ts]
export default defineNitroConfig({
  firebase: {
    httpOptions: {
      region: 'europe-west1',
      maxInstances: 3
    }
  }
})
```
```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    firebase: {
      httpOptions: {
        region: 'europe-west1',
        maxInstances: 3
      }
    }
  }
})
```
::

You can also set options for 1st generation Cloud Functions if the `gen` option is set to `1`. Note these are different from the options for 2nd generation Cloud Functions.

## Runtime Version

<!-- TODO: Prefer nitro config for Node.js version! -->

Firebase uses the `engines.node` version in your `package.json` to determine which node version to use for your functions. If you want to use a different version of node for your functions, you should set the `engines.node` version in your `package.json` to the version you want to use:

```json [package.json]
{
  "engines": {
    "node": "18"
  }
}
```

For some node versions you might also need to add a runtime key to your firebase.json file:

```json [firebase.json]
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs18"
  }
}
```

You can read more about this in [Firebase Docs](https://firebase.google.com/docs/functions/manage-functions?gen=2nd#set_nodejs_version).

## If your firebase project has other cloud functions

You may be warned that other cloud functions will be deleted when you deploy your nitro project. This is because nitro will deploy your entire project to firebase functions. If you want to deploy only your nitro project, you can use the `--only` flag:

```bash
firebase deploy --only functions:server,hosting
```
