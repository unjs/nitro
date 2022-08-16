import { defineTheme } from '@nuxt-themes/config'

export default defineTheme({
  title: '⚗️ Nitro',
  header: {
    title: true,
    logo: false
  },
  description: 'Build and Deploy Universal JavaScript Servers.',
  url: 'https://nitro.unjs.io',
  socials: {
    twitter: null,
    github: 'unjs/nitro'
  },
  github: {
    root: 'docs/content',
    edit: true,
    releases: false
  },
  aside: {
    level: 1
  },
  cover: {
    src: '/cover.jpg',
    alt: 'Nitro'
  },
  footer: {
    credits: {
      icon: '',
      text: 'MIT Licensed | Made by 💛 as part of the UnJS ecosystem',
      href: 'https://docus.com'
    },
    icons: []
  }
})
