import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'UnJS/Nitro',
  description: 'Build and deploy universal JavaScript servers.',
  lastUpdated: true,

  themeConfig: {
    repo: 'unjs/nitro',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',

    // algolia: {
    //   appId: '',
    //   apiKey: '',
    //   indexName: ''
    // },

    nav: [
      { text: 'Guide', link: '/', activeMatch: '^/$|^/guide/' },
      { text: 'Config Reference', link: '/config/general', activeMatch: '^/config/' },
      { text: 'Changelog', link: 'https://github.com/unjs/nitro/blob/main/CHANGELOG.md' }
    ],

    sidebar: {
      '/guide/': getGuideSidebar(),
      '/config/': getConfigSidebar(),
      '/': getGuideSidebar(),
    }
  }
})

function getConfigSidebar() {
return [
  {
    text: 'Config Reference',
    children: [
      ['/config/general', 'General'],
      ['/config/features', 'Features'],
      ['/config/routing', 'Routing'],
      ['/config/directories', 'Directories'],
      ['/config/advanced', 'Advanced'],
      ['/config/rollup', 'Rollup'],
    ].map(i => toItem(i))
  }
]
}

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        ['/guide/getting-started', 'Getting Started'],
        ['/guide/configuration', 'Configuration'],
        ['/guide/routing', 'Route Handling'],
        ['/guide/storage', 'Storage Layer'],
        ['/guide/cache', 'Cache API'],
        ['/guide/assets', 'Assets Handling'],
        ['/guide/typescript', 'Typescript Support'],
        ['/guide/contribution', 'Contribution'],
      ].map(i => toItem(i))
    },
    {
      text: 'Advanced',
      children: [
        ['/guide/plugins', 'Plugins'],
        ['/guide/presets', 'Deployment Presets'],
      ].map(toItem)
    }
  ]
}

function toItem (args: string[])  {
  return { link: args[0], text: args[1] }
}
