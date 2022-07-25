import { defineTheme } from '@nuxt-themes/config'

export default defineTheme({
  title: '⚗️ Nitro',
  header: {
    title: '⚗️ Nitro',
    logo: false
  },
  description: 'Build and Deploy Universal JavaScript Servers.',
  url: 'https://nitro.unjs.org',
  socials: {
    twitter: false,
    github: 'unjs/nitro'
  },
  github: {
    root: 'docs/content',
    edit: true,
    releases: true
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
