import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Nitro',
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
      { text: 'Guide', link: '/', activeMatch: '^/guide/' },
      { text: 'Deployment', link: '/deploy/', activeMatch: '^/deploy/' },
      { text: 'Config Reference', link: '/config/', activeMatch: '^/config/' },
      { text: 'Changelog', link: 'https://github.com/unjs/nitro/blob/main/CHANGELOG.md' }
    ],

    sidebar: {
      '/guide/': getGuideSidebar(),
      '/config/': 'auto',
      '/deploy/': getDeploymentSidebar(),
      '/': getGuideSidebar(),
    }
  }
})

function getDeploymentSidebar() {
  return [
    {
      text: 'General',
      children: [
        ['/deploy/', 'Overview'],
        ['/deploy/node', 'Node.js'],
      ].map(toItem)
    },
    {
      text: 'Providers',
      children: [
        ['/deploy/providers/aws', 'AWS'],
        ['/deploy/providers/azure', 'Azure'],
        ['/deploy/providers/cloudflare', 'Cloudflare'],
        ['/deploy/providers/digitalocean', 'DigitalOcean'],
        ['/deploy/providers/firebase', 'Firebase'],
        ['/deploy/providers/heroku', 'Heroku'],
        ['/deploy/providers/layer0', 'Layer0'],
        ['/deploy/providers/netlify', 'Netliy'],
        ['/deploy/providers/render', 'Render.com'],
        ['/deploy/providers/stormkit', 'Stormkit'],
        ['/deploy/providers/vercel', 'Vercel'],
      ].map(toItem)
    }
  ]
}


function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        ['/guide/', 'Getting Started'],
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
