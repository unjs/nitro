# Deployment Presets

Nitro can generate different output formats suitable for different hosting providers from same code base.

Using built-in presets, you can easily configure it to use one of them. Default output preset is [Node.js server](./node)

## Setting Preset

You can use the [nitro config](/config/) to explicitly set the preset to use:

```ts
export default defineNitroConfig({
  preset: 'node-server'
})
```

Or directly use the `NITRO_PRESET` environment variable when running `nitro build`:

```bash
NITRO_PRESET=aws-lambda nitro build
```
