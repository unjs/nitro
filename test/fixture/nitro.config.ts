import { defineNitroConfig } from '../../src'

export default defineNitroConfig({
  imports: {
    presets: [
      {
        // TODO: move this to built-in preset
        from: 'scule',
        imports: [
          'camelCase',
          'pascalCase',
          'kebabCase'
        ]
      }
    ]
  },
  publicAssets: [
    {
      baseURL: 'build',
      dir: 'public/build'
    }
  ],
  prerender: {
    crawlLinks: true,
    ignore: [
      // '/api/param/'
    ],
    routes: [
      '/prerender',
      '/icon.png',
      '/404'
    ]
  }
})
