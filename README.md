
<style>
td, th { border: none!important; }
</style>
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![npm-edge version][npm-edge-version-src]][npm-edge-version-href]
[![npm-edge downloads][npm-edge-downloads-src]][npm-edge-downloads-href]
<!-- [![GitHub Actions][github-actions-src]][github-actions-href] [![Codecov][codecov-src]][codecov-href] -->

<h1 align="center">⚗️ Nitro</h1>
<p align="center">Build and deploy universal JavaScript servers!</p>



## Why using Nitro?

Nitro provides a powerful toolchain and a runtime framework from the [UnJS](https://github.com/unjs) ecosystem to build and deploy **any JavaScript server, anywhere!**

 ❯ **Rapid development** experience with hot module replacement <br>
 ❯ **Multi-provider** deployments with a single codebase and zero-configuration<br>
 ❯ **Portable and compact** deployments without `node_modules` dependency <br>
 ❯ **Directory structure** aware to register API routes and more with zero configuration <br>
 ❯ **Minimal Design** to fit into any solution with minimum overhead <br>
 ❯ **Code-splitting** and async chunk loading for fast server startup time <br>
 ❯ **TypeScript** fully supported <br>
 ❯ **Multi-driver storage** and caching layer <br>
 ❯ **Route caching** and static **pre-rendering** with built-in crawler <br>
 ❯ **Hackable** to extend almost any part of nitro using options <br>
 ❯ **Auto imports** for lazy folks and a tidy minimal codebase <br>
 ❯ **Best-effort compatibility** for using legacy npm packages and mocking Node.js modules <br>

## Who is using Nitro?

[Nuxt 3](https://v3.nuxtjs.org/guide/concepts/server-engine) is using Nitro as it's server engine.

<hr>

<table align="center">
<tbody>
<tr>
  <td>
    <h2>
      <a href="https://nitro.unjs.io">📖 Documentation</a>
    </h2>
  </td>
  <td>
    <h2>
      <a href="https://github.com/unjs/nitro/blob/main/CHANGELOG.md">✍️ Changelog</a>
    </h2>
  </td>
  <td>
    <h2>
      <a href="https://stackblitz.com/github/unjs/nitro/tree/main/examples/hello-world">🏀 Online playground</a>
    </h2>
  </td>
</tr>
</tbody>
</table>

<h2 align="center">😺 Quick Start</h2>

0️⃣ Create an empty directory `nitro-app`

```bash
mkdir nitro-app
cd nitro-app
```

1️⃣ Create `routes/index.ts`:

```ts [routes/index.ts]
export default () => 'nitro is amazing!'
```

2️⃣ Start development server:

```bash
npx nitropack dev
```

🪄 Your API is ready at `http://localhost:3000/`

**🤓 [TIP]** Check `.nitro/dev/index.mjs` if want to know what is happening

3️⃣ You can now build your production-ready server:

```bash
npx nitropack build
````

4️⃣ Output is in the `.output` directory and ready to be deployed on almost any VPS with no dependencies. You can locally try it too:

```bash
node .output/server/index.mjs
```

That's it you got it! Read the [documentation](https://nitro.unjs.io) to learn more.



<hr>
<h3 align="center">🌱 nitro is young and under development</h3>

Check [🐛 open issues](https://github.com/unjs/nitro/issues)  for the known issues and roadmap and tell us [💡your ideas](https://github.com/unjs/nitro/discussions/new)!
<hr>


## License

Made with 💛 Published under [MIT](./LICENSE).

<!-- Badges -->
[npm-version-src]: https://flat.badgen.net/npm/v/nitropack?style=flat-square&label=stable
[npm-version-href]: https://npmjs.com/package/nitropack

[npm-downloads-src]: https://flat.badgen.net/npm/dm/nitropack?style=flat-square&label=stable
[npm-downloads-href]: https://npmjs.com/package/nitropack

[npm-edge-version-src]: https://flat.badgen.net/npm/v/nitropack-edge?style=flat-square&label=edge
[npm-edge-version-href]: https://npmjs.com/package/nitropack-edge

[npm-edge-downloads-src]: https://flat.badgen.net/npm/dm/nitropack-edge?style=flat-square&label=edge
[npm-edge-downloads-href]: https://npmjs.com/package/nitropack-edge

[github-actions-src]: https://flat.badgen.net/github/status/unjs/nitro?style=flat-square
[github-actions-href]: https://github.com/unjs/nitro/actions?query=workflow%3Aci

[codecov-src]: https://flat.badgen.net/codecov/c/gh/unjs/nitro/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/nitro
