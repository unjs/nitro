# Rollup

**⚠️ Caution! Rollup options are considered advanced, and things can go wrong if misconfigured.** nitro and presets provide the best defaults.

## `rollupConfig`

Additional rollup configuration.

## `entry`

Rollup entry.

## `unenv`

Options for [unjs/unenv](https://github.com/unjs/unenv/) preset.

## `alias`

Rollup aliases options.

## `minify`

- Default: `false`

Minify bundle.

## `inlineDynamicImports`

Avoid creating chunks.

## `sourceMap`

Enable source-map generation

## `node`

Specify whether the build is used for Node.js or not. If set to `false`, nitro tried to mock Node.js dependencies using [unjs/unenv](https://github.com/unjs/unenv) and adjust its behavior.

## `analyze`

If enabled, will analyze server bundle after build using [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). You can also pass your custom options.

## `moduleSideEffects`

Default: `[unenv/runtime/polyfill/]`

Rollup specific option. Specifies module imports that have side-effects

## `replace`

Rollup specific option.

