---
icon: game-icons:cold-heart
---

# WinterJS

**Preset:** `winterjs` ([switch to this preset](/deploy/#changing-the-deployment-preset))

You can easily build Nitro powered applications to run with [wasmerio/winterjs](https://github.com/wasmerio/winterjs) runtime.

[WinterJS](https://github.com/wasmerio/winterjs) is a JavaScript Service Workers server written in Rust, that uses the SpiderMonkey runtime to execute JavaScript (the same runtime that Firefox uses) ([announcement](https://wasmer.io/posts/announcing-winterjs-service-workers)).


::alert{type="warning"}
🌙 WinterJS is currently supported in **nightly release channel**. Read the docs for using [Nightly Release Channel](/guide/getting-started#nightly-release-channel).
::


::alert{type="warning"}
🚧 WinterJS runtime is unstable and under heavy development. Follow [unjs/nitro#1861](https://github.com/unjs/nitro/issues/1861) for status and information.
::


In order to build for this runtime, use `NITRO_PRESET="winterjs"` environment variable:

```sh
NITRO_PRESET="winterjs" npm run build
```

Make sure you have `wasmer` installed locally ([install wasmer](https://docs.wasmer.io/install))

Run locally:

```sh
wasmer run wasmer/winterjs --forward-host-env --net --mapdir app:.output app/server/index.mjs
```
