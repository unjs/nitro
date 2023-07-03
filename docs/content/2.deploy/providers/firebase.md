# Firebase

Deploy Nitro apps to Firebase.

**Preset:** `firebase` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports [Firebase Hosting](https://firebase.google.com/docs/hosting) with Cloud Functions out of the box.

**Note**: You need to be on the **Blaze plan** to use Nitro with Cloud Functions.

If you don't already have a `firebase.json` in your root directory, Nitro will create one the first time you run it. In this file, you will need to replace `<your_project_id>` with the ID of your Firebase project.

This file should then be committed to version control. You can also create a `.firebaserc` file if you don't want to manually pass your project ID to your `firebase` commands (with `--project <your_project_id>`):

```json [.firebaserc]
{
  "projects": {
    "default": "<your_project_id>"
  }
}
```

Then, just add Firebase dependencies to your project:

```bash
# yarn
yarn add --dev firebase-admin firebase-functions firebase-functions-test

# npm
npm install -D firebase-admin firebase-functions firebase-functions-test
```

### Using Firebase CLI

You may instead prefer to set up your project with the Firebase CLI, which will fetch your project ID for you, add required dependencies (see above) and even set up automated deployments via GitHub Actions.

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

## Deploy to Firebase Hosting via CLI

Deploying to Firebase Hosting is a simple matter of just running the `firebase deploy` command.

```bash
NITRO_PRESET=firebase yarn build
firebase deploy
```

## Changing cloud function settings

Using the firebase v1 preset, there is currently no configuration to be able to change the region that the functions are deployed to. In order to change the region and any other firebase functions options, you will need to use the `replace` key in the nitro config. Here you will be able to change the `region` as well as `runWith` options for the functions.

### Changing the region

```ts [nitro.config.ts]
export default defineNitroConfig({
  /* Other config options */
  preset: "firebase",
  replace: {
    "functions.https.onRequest": "functions.region('europe-west2').https.onRequest",
  },
});
```

### Changing the runWith options

Check the [firebase functions docs](https://firebase.google.com/docs/functions/manage-functions?gen=1st#min-max-instances) for all runWith options.

```ts [nitro.config.ts]
export default defineNitroConfig({
  /* Other config options */
  preset: "firebase",
  replace: {
    "functions.https.onRequest": "functions.runWith({ maxInstances: 10 }).https.onRequest",
  },
});
```

### Makeing it typesafe

You can make the runWith options more typesage by creating an object first and then JSON.stringify it into the replacer string:

```ts [nitro.config.ts]
import { SUPPORTED_REGIONS, RuntimeOptions } from 'firebase-functions'

const region: SUPPORTED_REGIONS = 'europe-west2'
const runtimeOptions: RuntimeOptions = {
  memory: '1GB',
  maxInstances: 10
  // ...etc
}

export default defineNitroConfig({
  /* Other config options */
  preset: "firebase",
  replace: {
    "functions.https.onRequest": `functions.region('${region}').runWith(${JSON.stringify(runtimeOptions)}).https.onRequest`,
  },
});
```

### Changing options in Nuxt

In Nuxt, the replace key is found under the `nitro` key in the nuxt config.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  /* Other config options */
  nitro: {
    preset: "firebase",
    replace: {
      "functions.https.onRequest": "functions.region('europe-west2').https.onRequest",
    },
  },
});
```
