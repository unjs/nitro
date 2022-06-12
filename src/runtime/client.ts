// Client polyfill
import { $fetch } from 'ohmyfetch'
import { $Fetch, NitroFetchRequest } from '../types'

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch as $Fetch<unknown, NitroFetchRequest>
}
