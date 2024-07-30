# Genezio

> Deploy Nitro apps to Genezio.

**Preset:** `genezio`

:read-more{title="Genezio" to="https://genezio.com"}

# Project Setup

## 1. Install genezio CLI globally

```bash
npm install genezio -g
```

## Build and deploy

#### Build your Nitro project using the `Genezio` preset:

```bash
nitro build --preset genezio
```

Building the project will automatically create a default `genezio.yaml` configuration file, if it doesn't already exist.

By default, the name will be the one specified in the `package-lock.json` file, and the region will be set to `us-east-1`.

To further customize the file to your needs, you can consult the
[official documentation](https://genezio.com/docs/project-structure/genezio-configuration-file/).

## 2. Deploy your project

Run the following command in your terminal:

```bash
genezio deploy
```

For projects that set environment backends, you can check the following tutorial: [Genezio - Environment Variables](https://genezio.com/docs/project-structure/backend-environment-variables).

## 3. Monitor your project
You can monitor and manage your application through the [Genezio App Dashboard](https://app.genez.io/dashboard). The dashboard URL, also provided after deployment, allows you to access comprehensive views of your project's status and logs.

