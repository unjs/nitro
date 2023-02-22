export default defineAppConfig({
  docus: {
    title: '⚗️ Nitro',
    header: {
      title: false,
      logo: true,
      fluid: true
    },
    description: 'Build and Deploy Universal JavaScript Servers.',
    url: 'https://nitro.unjs.io',
    image: '/cover.png',
    socials: {
      twitter: 'unjsio',
      github: 'unjs/nitro'
    },
    github: {
      owner: 'unjs',
      repo: 'nitro',
      branch: 'main',
      dir: 'docs/content',
      edit: true
    },
    main: {
      fluid: true
    },
    aside: {
      level: 1
    },
    footer: {
      fluid: true,
      credits: {
        icon: '',
        text: 'Made with 💛',
        href: 'https://github.com/unjs/nitro'
      },
      icons: []
    }
  }
})
