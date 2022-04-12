## Routing

## `baseURL`

Default: `/` (or `NITRO_APP_BASE_URL` environment variable if provided)

Server's main base URL.

## `handlers`

Server handlers and routes.

If `routes/`, `api/` or `middleware/` directories exist, they will be automatically added to the handlers array.

## `devHandlers`

Regular handlers refer to the path of handlers to be imported and transformed by rollup.

There are situations in that we directly want to provide a handler instance with programmatic usage.

We can use `devHandlers` but note that they are **only available in development mode** and **not in production build**.

## `errorHandler`

Path to a custom runtime error handler. Replacing nitro's built-in error page.

**Example:**

```js [nitro.config]
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  errorHandler: '~/error'
})
```

```js [error.ts]
import type { NitroErrorHandler } from 'nitropack'

export default <NitroErrorHandler> function (error, event) {
  event.res.end('[custom error handler] ' + error.stack)
}
```

## `routes`

**🧪 Experimental!**

Route options. It is a map from route pattern (following [unjs/radix3](https://github.com/unjs/radix3)) to options.

Example:

```js
{
  routes: {
    '/blog/**': { swr: true }
  }
}
```

## `prerenderer`

Default: `{ crawlLinks: false, routes: [] }`

Prerendered options. Any route specified will be fetched during the build and copied to the `.output/public` directory as a static asset.

If `crawlLinks` option is set to `true`, nitro starts with `/` by default (or all routes in `routes` array) and for HTML pages extracts `<a href="">` tags and prerender them as well.

