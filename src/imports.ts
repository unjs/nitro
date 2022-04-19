import type { Preset } from 'unimport'

export const nitroImports: Preset[] = [
  {
    from: '#internal/nitro',
    imports: [
      'defineCachedFunction',
      'defineCachedEventHandler',
      'useRuntimeConfig',
      'useStorage',
      'useNitroApp',
      'defineNitroPlugin',
      'nitroPlugin'
    ]
  },
  {
    from: 'h3',
    imports: [
      'defineEventHandler',
      'defineLazyEventHandler',
      'eventHandler',
      'lazyEventHandler',
      'dynamicEventHandler',
      'appendHeader',
      'assertMethod',
      'createError',
      'handleCacheHeaders',
      'isMethod',
      'sendRedirect',
      'useCookies',
      'useCookie',
      'deleteCookie',
      'setCookie',
      'useBody',
      'useMethod',
      'useQuery',
      'useRawBody'
    ]
  }
]
