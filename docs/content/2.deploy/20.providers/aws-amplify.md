# AWS Amplify

Deploy Nitro apps to [AWS Amplify Hosting](https://aws.amazon.com/amplify/).

**Preset:** `aws_amplify` ([switch to this preset](/deploy/#changing-the-deployment-preset))

## Deploy to AWS Amplify Hosting

::alert
**Zero Config Provider**
:br
Integration with this provider is possible with zero configuration. ([Learn More](/deploy/#zero-config-providers))
::

1. Login to the [AWS Amplify Hosting Console](https://console.aws.amazon.com/amplify/)
2. Click on "Get Started" > Amplify Hosting (Host your web app)
3. Select and authorize access to your Git repository provider and select the main branch
4. Choose a name for your app, make sure build settings are auto-detected and optionally set requirement environment variables under the advanced section
5. Optionally, select Enable SSR logging to enable server-side logging to your Amazon CloudWatch account 
6. Confirm configuration and click on "Save and Deploy"


## Advanced Configuration

You can configure advanced options of this preset using `awsAmplify` option.

::code-group
```ts [nitro.config.ts]
export default defineNitroConfig({
  awsAmplify: {
      // catchAllStaticFallback: true,
      // imageOptimization: { path: "/_image", cacheControl: "public, max-age=3600, immutable" },
      // imageSettings: { ... },
  }
})
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    awsAmplify: {
      // catchAllStaticFallback: true,
      // imageOptimization: { "/_image", cacheControl: "public, max-age=3600, immutable" },
      // imageSettings: { ... },
    }
  }
})
```
::

### `amplify.yml`

You might need a custom `amplify.yml` file for advanced configuration. Here are two template examples:

::code-group
```yml [amplify.yml]
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 18 && node --version
        - corepack enable && npx --yes nypm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .amplify-hosting
    files:
      - "**/*"
```

```yml [amplify.yml (monorepo)]
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
          - nvm use 18 && node --version
          - corepack enable && npx --yes nypm install
        build:
          commands:
            - pnpm --filter website1 build
      artifacts:
        baseDirectory: apps/website1/.amplify-hosting
        files:
          - '**/*'
      buildPath: /
    appRoot: apps/website1
```
::
