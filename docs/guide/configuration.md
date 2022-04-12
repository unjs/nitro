# Configuration

In order to customize nitro's behavior, we can use `nitro.config`.

It is powerful enough that all deployment providers are built on the same options API!!

Create a new `nitro.config.ts` file to provide options:

```js
// nitro.config.ts
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
})
```

**TIP:** nitro handles configuration loading using [unjs/c12](https://github.com/unjs/c12). You have more advanced possibilities such as using `.env`. And `.nitrorc`.
