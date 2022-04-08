# TypeScript Support

Nitro uses the `#nitro` alias for runtime helpers and global imports. To add type support within your project,
you should add the following to your `tsconfig.json` file:

```json
{
  "extends": "./.nitro/types/tsconfig.json"
}
```
