export default defineAppConfig({
  docus: {
    title: "Nitro",
    header: {
      logo: true,
    },
    description: "Create web servers that run anywhere.",
    url: "https://nitro.unjs.io",
    image: "/cover.png",
    socials: {
      twitter: "unjsio",
      github: "unjs/nitro",
    },
    github: {
      owner: "unjs",
      repo: "nitro",
      branch: "main",
      dir: "docs/content",
      edit: true,
    },
    aside: {
      level: 1,
    },
    footer: {
      credits: {
        icon: "",
        text: "Made with 💛",
        href: "https://github.com/unjs/nitro",
      },
      iconLinks: [
        {
          href: "https://unjs.io",
          icon: "IconUnJS",
          label: "UnJS",
        },
      ],
    },
  },
});
