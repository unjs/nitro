# Route Handling

Handler files inside `routes/` and `api/` directory will be automatically mapped to [unjs/h3](https://github.com/unjs/h3) routes.

**Note:** `api/` is a shortcut for `routes/api` as a common prefix. However, please note that some deployment providers use `app/` directory for their API format. You can simply use the `routes/api` or `srcDir` option to move everything under `src/` or `server/` directory.

## Usage

Check out [h3 JSDocs](https://www.jsdocs.io/package/h3#package-index-functions) for all available utilities.

## Examples

**Example:** Simple API route

```js
// routes/test.ts
export default eventHandler(() => 'Hello World!')
```

**Example:** API route with params

```js
// routes/hello/[name].ts
export default eventHandler(event => `Hello ${event.context.params.name}!`)
```

**Example:** API route with a specific HTTP request method (get, post, put, delete, options and so on)

```js
// routes/user.get.ts
export default eventHandler(async event => {
  return `User profile!`
})
```

```js
// routes/user.post.ts
export default eventHandler(async event => {
  const body = await useBody(event)
  // TODO: Handle body and update user
  return `User updated!`
})
```

**Example:** Catch all page

```js
// routes/[...].ts
export default eventHandler(event => `Default page`)
```

