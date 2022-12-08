import { defineTheme } from "@nuxt-themes/config";

export default defineTheme({
  title: "⚗️ Nitro",
  header: {
    title: false,
    logo: true,
  },
  description: "Build and Deploy Universal JavaScript Servers.",
  url: "https://nitro.unjs.io",
  socials: {
    twitter: "unjsio",
    github: "unjs/nitro",
  },
  github: {
    root: "docs/content",
    edit: true,
    releases: false,
  },
  aside: {
    level: 1,
  },
  cover: {
    src: "/cover.jpg",
    alt: "Nitro",
  },
  footer: {
    credits: {
      icon: "",
      text: "Made with 💛",
      href: "https://github.com/unjs/nitro",
    },
    icons: [],
  },
});
