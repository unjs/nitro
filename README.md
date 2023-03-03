# ⚗️ Nitro

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]
<!-- [![GitHub Actions][github-actions-src]][github-actions-href] [![Codecov][codecov-src]][codecov-href] -->

Nitro provides a powerful toolchain and a runtime framework from the [UnJS](https://github.com/unjs) ecosystem to build and deploy **any JavaScript server, anywhere.**

- 📖 [Documentation](https://nitro.unjs.io)
- ✍️ [Changelog](https://github.com/unjs/nitro/blob/main/CHANGELOG.md)
- 🏀 Online playground: [StackBlitz](https://stackblitz.com/github/unjs/nitro/tree/main/examples/hello-world) / [CodeSandbox](https://codesandbox.io/p/sandbox/nitro-5jssbm)

## Features

- 🐇 **Rapid development** experience with hot module replacement <br>
- 😌 **Multi-provider** deployments with a single codebase and zero-configuration<br>
- 💼 **Portable and compact** deployments without `node_modules` dependency <br>
- 📁 **Directory structure** aware to register API routes and more with zero configuration <br>
- 🤏 **Minimal Design** to fit into any solution with minimum overhead <br>
- 🚀 **Code-splitting** and async chunk loading for fast server startup time <br>
- 👕 **TypeScript** fully supported <br>
- 💾 **Multi-driver storage** and caching layer <br>
- 💰 **Route caching** and static **pre-rendering** with built-in crawler <br>
- 🐱 **Hackable** to extend almost any part of nitro using options <br>
- ✨ **Auto imports** for lazy folks and a tidy minimal codebase <br>
- 🏛️ **Best-effort compatibility** for using legacy npm packages and mocking Node.js modules <br>

## Who is using Nitro?

[Nuxt](https://nuxt.com) is using Nitro as its [server engine](https://nuxt.com/docs/guide/concepts/server-engine).

## 😺 Quick Start

Create an empty directory `nitro-app`

```bash
mkdir nitro-app
cd nitro-app
```

Create a `routes/index.ts`:

```ts
export default defineEventHandler(() => "Hello from Nitro");
```

Start the development server:

```bash
npx nitropack dev
```

🪄 Your API is ready at `http://localhost:3000/`

Check `.nitro/dev/index.mjs` if want to know what is happening.

Build your production-ready server:

```bash
npx nitropack build
```

The output is in the `.output` directory and ready to be deployed on almost any VPS with no dependencies. You can locally try it too:

```bash
node .output/server/index.mjs
```

That simple! Read the [documentation](https://nitro.unjs.io) to learn more.

### Contributing

Clone the repository and install the dependencies using [pnpm](https://pnpm.io/) and stub nitropack:

```sh
pnpm i
npm run stub
```

Run the local [playground/](./playground):

```sh
npm run dev
```

Run the [tests](./test) with [Vitest](https://vitest.dev):

```sh
npm run test
```

Checkout the 🐛 [open issues](https://github.com/unjs/nitro/issues) for the known issues and roadmap or tell us 💡 [your ideas](https://github.com/unjs/nitro/discussions/new).

## License

Made with 💛 Published under [MIT](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nitropack?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/nitropack
[npm-downloads-src]: https://img.shields.io/npm/dm/nitropack?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/nitropack
[github-actions-src]: https://flat.badgen.net/github/status/unjs/nitro?style=flat-square
[github-actions-href]: https://github.com/unjs/nitro/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/nitro/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/unjs/nitro
[license-src]: https://img.shields.io/github/license/unjs/nitro.svg?style=flat&colorA=18181B&colorB=F0DB4F
[license-href]: https://github.com/unjs/nitro/blob/main/LICENSE
