# Firebase

Deploy Nitro apps to Firebase.

**Preset:** `firebase` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports [Firebase Hosting](https://firebase.google.com/docs/hosting) with Cloud Functions out of the box.

**Note**: You need to be on the **Blaze plan** to use Nitro with Cloud Functions.

**Note**: This preset will deploy to firebase functions v1. If you want to deploy to firebase functions v2, please use the [`firebase-v2`](#firebase-functions-v2) preset.

### Setup Using Nitro

If you don't already have a `firebase.json` in your root directory, Nitro will create one the first time you run it. In this file, you will need to replace `<your_project_id>` with the ID of your Firebase project. This file should then be committed to version control.

#### Create a .firebaserc file

It is also recommended to create a `.firebaserc` file so you don't need to manually pass your project ID to your `firebase` commands (with `--project <your_project_id>`):

```json [.firebaserc]
{
  "projects": {
    "default": "<your_project_id>"
  }
}
```

#### Install Firebase dependencies

Then, add Firebase dependencies to your project:

yarn:

```bash
yarn add --dev firebase-admin firebase-functions firebase-functions-test
```

npm:

```bash
npm install -D firebase-admin firebase-functions firebase-functions-test
```

#### Install Firebase CLI globally

Make sure you have the latest version of the firebce CLI installed:

yarn:

```bash
yarn global add firebase-tools
```

npm:

```bash
npm install -g firebase-tools
```

### Alternative Setup Using Firebase CLI

You may instead prefer to set up your project with the Firebase CLI, which will fetch your project ID for you, add required dependencies (see above) and even set up automated deployments via GitHub Actions. [Learn about installing the firebase CLI](https://firebase.google.com/docs/cli#windows-npm).

#### Install Firebase CLI globally

```bash
# yarn
yarn global add firebase-tools

# npm
npm install -g firebase-tools
```

**Note**: You need to be on [^11.18.0](https://github.com/firebase/firebase-tools/releases/tag/v11.18.0) to deploy a nodejs18 function.

#### Initialize your Firebase project

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

## Local preview

You can preview a local version of your site if you need to test things out without deploying.

```bash
NITRO_PRESET=firebase yarn build
firebase emulators:start
```

## Build and Deploy

Deploy to Firebase Hosting by running a nitro build and then running the `firebase deploy` command.

```bash
NITRO_PRESET=firebase yarn build
firebase deploy
```

## Firebase Functions v2

**Preset:** `firebase-v2` ([switch to this preset](/deploy/#changing-the-deployment-preset))

This preset will deploy to [firebase functions V2](https://firebase.google.com/docs/functions/version-comparison) - the 2nd generation of cloud functions.

It works the same as the [`firebase`](#firebase) preset above, but uses the V2 functions runtime.

### Setup

Follow the instructions for the `firebase` preset above for setup and deploy.

**Caution**: New HTTP and HTTP callable functions deployed with any Firebase CLI lower than version 7.7.0 are private by default and throw HTTP 403 errors when invoked. Either explicitly [make these functions public](https://cloud.google.com/functions/docs/securing/managing-access-iam#allowing_unauthenticated_http_function_invocation) or [update your Firebase CLI](https://firebase.google.com/docs/cli#setup_update_cli) before you deploy. If you deploy the function and it is not publicly accessible, then you will need to visit the [Functions Console](https://console.cloud.google.com/functions/list) on Google cloud platform, click your function name, select the 'Permissions' tab and follow the instructions on how to make the function public.

### Options

The `firebase-v2` preset also supports passing options to the firebase function via the nitro config. These options are defined in the nitro config object under `firebase.httpRequestOptions`.

The `httpRequestOptions` object is passed to `functions.https.onRequest()` function as the first argument as per the [firebase docs](https://firebase.google.com/docs/functions/http-events?gen=2nd#trigger_a_function_with_an_http_request).

For example, to set the region and max instances of the function, you can add the following to your `nitro.config.ts`:

```ts
import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  // Nitro options...
  firebase: {
    httpRequestOptions: {
      region: "europe-west1",
      maxInstances: 3,
      // etc.
    }
  }
})
```

The documentation for the `httpRequestOptions` option can be found in the [firebase functions 2nd gen docs](https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.https.httpsoptions).

### Runtime

Firebase uses the engines.node version in your `package.json` to determine which node version to use for your functions. If you want to use a different version of node for your functions, you should set the `engines.node` version in your `package.json` to the version you want to use:

```json [package.json]
{
  "engines": {
    "node": "18"
  }
}
```

For some node versions you will also need to add a runtime key to your firebase.json file:

```json [firebase.json]
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs18"
  }
}
```

## If your firebase project has other cloud functions

You may be warned that other cloud functions will be deleted when you deploy your nitro project. This is because nitro will deploy your entire project to firebase functions. If you want to deploy only your nitro project, you can use the `--only` flag:

```bash
firebase deploy --only functions:server,hosting
```
