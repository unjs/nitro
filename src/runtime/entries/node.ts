import '#polyfill'
import * as nodeFetch from 'node-fetch'
import { nitroApp } from '../app'

// TODO: Workaround for rollup treeshaking polyfills
// @ts-ignore
globalThis.fetch = globalThis.fetch || nodeFetch.default || nodeFetch
// @ts-ignore
globalThis.Request = globalThis.Request || nodeFetch.Request
// @ts-ignore
globalThis.Response = globalThis.Response || nodeFetch.Response
globalThis.Headers = globalThis.Headers || nodeFetch.Headers

export const handler = nitroApp.h3App.nodeHandler
