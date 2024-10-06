# Coolify

> Deploy Nitro apps to [Coolify](https://coolify.io).

**Preset:** `coolify`

:read-more{title="coolify.io" to="https://coolify.io/docs/"}

::note
This is the recommended preset for Coolify deployments.
::

Coolify supports deploying both static and server-side rendered apps with zero configuration.

## Set up your web app

In your project, set Nitro preset to `coolify`.

```js
export default {
  nitro: {
    preset: 'coolify'
  }
}
```

## Getting started

1. Log in to Coolify dashboard and create a new project.
2. Select GitHub App and repository, then click "Load Repository".
3. Set `Build Pack` to `nixpacks` and `Port` to `3000`.
4. Enable healthchecks in project sidebar.
5. Add environment variables if needed.
6. Click "Deploy".

You're all set up!

When you push changes to your repository, Coolify will automatically rebuild your app.