# Assets Handling

## Public Assets

All assets in `public/` directory will be automatically served.

## Server Assets

All assets in `server/assets/` directory will be automatically served.

They can be addressed by the key `assets/server/my_file_path`.

Any of those assets can be retrieved through `useStorage`. See [unjs/unstorage](https://github.com/unjs/unstorage) for more usage information.

::: info Tip!
Assets keys can be written `assets/server/my_file_path` or `assets:server:my_file_path`.
:::

### Custom Server Assets

In order to add assets to another folder, this folder will need to be defined in the nitro config:

```js
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  serverAssets: [{
    baseName: 'my_folder',
    dir: './server/my_folder'
  }]
})
```

They can be addressed by the key `assets/my_folder/my_file_path`.

### Examples

**Example:** Retrieving a json data from default `assets` folder

```js
export default defineEventHandler(async () => {
  const data = await useStorage().getItem(`assets:server:data.json`)
  return data
})
```

**Example:** Retrieving a html file from a custom `assets` folder

```js
// nitro.config.ts
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  serverAssets: [{
    baseName: 'templates',
    dir: './server/templates'
  }]
})
```

```js
export default defineEventHandler(async () => {
  const html = await useStorage().getItem(`assets/templates/success.html`)
  return html
})
```
