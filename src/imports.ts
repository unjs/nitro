import type { Preset } from 'unimport'

export const nitroImports: Preset[] = [
  {
    from: '#nitro',
    imports: [
      'defineCachedFunction',
      'defineCachedEventHandler',
      'useConfig',
      'useStorage',
      'useNitroApp'
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
