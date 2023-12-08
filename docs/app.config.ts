export default defineAppConfig({
  ui: {
    primary: 'red',
    gray: 'neutral',
  },
  header: {
    logo: {
      alt: "Nitro logo",
      light: "/nitro-dark.svg",
      dark: "/nitro-light.svg",
    },
    search: true,
    colorMode: true,
    links: [
      {
        icon: "i-simple-icons-x",
        to: "https://twitter.com/unjsio",
        target: "_blank",
        "aria-label": "Unjs on X",
      },
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/unjs/nitro",
        target: "_blank",
        "aria-label": "UnJS/Nitro on GitHub",
      },
    ],
  },
  footer: {
    credits: " Made with 💛",
    links: [
      {
        to: "https://unjs.io/",
        target: "_blank",
        "aria-label": "Unjs Website",
        slot: 'unjs'
      },
      {
        icon: "i-simple-icons-x",
        to: "https://twitter.com/unjsio",
        target: "_blank",
        "aria-label": "Unjs on X",
      },
      {
        icon: "i-simple-icons-github",
        to: "https://github.com/unjs/nitro",
        target: "_blank",
        "aria-label": "UnJS/Nitro on GitHub",
      },
    ],
  },
});
