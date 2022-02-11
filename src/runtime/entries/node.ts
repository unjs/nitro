import '#polyfill'

// TODO: Workaround for rollup treeshaking polyfills
import * as nodeFetch from 'node-fetch'
// @ts-ignore
globalThis.fetch = globalThis.fetch || nodeFetch.default || nodeFetch
// @ts-ignore
globalThis.Request = globalThis.Request || nodeFetch.Request
// @ts-ignore
globalThis.Response = globalThis.Response || nodeFetch.Response
globalThis.Headers = globalThis.Headers || nodeFetch.Headers

export * from '..'
