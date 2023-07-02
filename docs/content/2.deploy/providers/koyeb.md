# Koyeb

Deploy Nitro apps to Koyeb.

**Preset:** `koyeb` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying on [Koyeb](https://www.koyeb.com/) with minimal configuration.

## Using the Control Panel

1. (Optional) Add a `start` command to your `package.json` file to define how to start your application:

   ```json
   {
      ...
      "scripts": {
         ...
         "start": "node .output/server/index.mjs"
      }
      ...
   }
   ```

2. In the [Koyeb control panel](https://app.koyeb.com/), click **Create App**.

3. Choose **GitHub** as your deployment method.

4. Choose the GitHub **repository** and **branch** containing your application code.

5. Name your Service, for example `nuxt-service`.

6. If you did not add a `start` command to your `package.json` file, under the **Build and deployment settings**, toggle the override switch associated with the run command field.  In the **Run command** field, enter:

   ```bash
   node .output/server/index.mjs`
   ```

7. In the **Advanced** section, click **Add Variable** and add a `NITRO_PRESET` variable set to `koyeb`.

8. Name the App.

9. Click the **Deploy** button.

## Using the Koyeb CLI

1. Follow the instructions targeting your operating system to [install the Koyeb CLI client](https://www.koyeb.com/docs/cli/installation) with an installer.  Alternatively, visit the [releases page on GitHub](https://github.com/koyeb/koyeb-cli/releases) to directly download required files.

2. Create a Koyeb API access token by visiting the [API settings for your organization](https://app.koyeb.com/settings/api) in the Koyeb control panel.

3. Log into your account with the Koyeb CLI by typing:

   ```bash
   koyeb login
   ```

   Paste your API credentials when prompted.

4. Deploy your Nitro application from a GitHub repository with the following command.  Be sure to substitute your own values for `<APPLICATION_NAME>`, `<YOUR_GITHUB_USERNAME>`, and `<YOUR_REPOSITORY_NAME>`:

   ```bash
   koyeb app init <APPLICATION_NAME> \
     --git github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME> \
     --git-branch main \
     --git-run-command "node .output/server/index.mjs" \
     --ports 3000:http \
     --routes /:3000 \
     --env PORT=3000 \
     --env NITRO_PRESET=koyeb
   ```

## Using a Docker container

1. Create a `.dockerignore` file in the root of your project and add the following lines:

   ```docker
   Dockerfile
   .dockerignore
   node_modules
   npm-debug.log
   .nuxt
   .output
   .git
   dist
   README.md
   ```

2. Add a `Dockerfile` to the root of your project:

   ```Dockerfile
   FROM node:18-alpine AS base
   
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build && npm cache clean --force
   
   FROM base AS runner
   WORKDIR /app
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nuxt
   COPY --from=builder /app .
   USER nuxt
   EXPOSE 3000
   ENV PORT 3000
   CMD ["npm", "run", "start"]
   ```

The Dockerfile above provides the minimum requirements to run the Nuxt application. You can easily extend it depending on your needs.
You will then need to push your Docker image to a registry. You can use [Docker Hub](https://hub.docker.com/) or [GitHub Container Registry](https://docs.github.com/en/packages/guides/about-github-container-registry) for example.
In the Koyeb control panel, use the image and the tag field to specify the image you want to deploy.
You can also use the [Koyeb CLI](https://www.koyeb.com/docs/build-and-deploy/cli/installation)
Refer to the Koyeb [Docker documentation](https://www.koyeb.com/docs/build-and-deploy/prebuilt-docker-images) for more information.
