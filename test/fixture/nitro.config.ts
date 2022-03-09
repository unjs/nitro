import { defineNitroConfig } from '../..'

export default defineNitroConfig({
  autoImport: {
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
  }
})
