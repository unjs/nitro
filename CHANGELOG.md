# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v2.4.0

[compare changes](https://github.com/unjs/nitro/compare/v2.3.3...v2.4.0)


### 🚀 Enhancements

  - Add cloudflare module worker support ([#681](https://github.com/unjs/nitro/pull/681))
  - **vercel, netlify:** Introduce `isr` route rule ([#1124](https://github.com/unjs/nitro/pull/1124))
  - Add `static` preset ([#1127](https://github.com/unjs/nitro/pull/1127))
  - Add `vercel-static` and `netlify-static` presets ([#1073](https://github.com/unjs/nitro/pull/1073))
  - Add `github-pages` preset ([#1133](https://github.com/unjs/nitro/pull/1133))
  - Pass resolved config to `rollup:before` hook ([#1160](https://github.com/unjs/nitro/pull/1160))
  - Config reload support for `nitro dev` ([#1173](https://github.com/unjs/nitro/pull/1173))
  - Config hmr support for `routeRules` and `rutimeConfig` ([#1175](https://github.com/unjs/nitro/pull/1175))
  - Support dynamic app config and runtime config ([#1154](https://github.com/unjs/nitro/pull/1154))
  - Experimental `/_nitro/openapi.json` and `/_nitro/swagger` for dev mode ([#1162](https://github.com/unjs/nitro/pull/1162))
  - **vercel:** Add support for specifying edge regions ([#1192](https://github.com/unjs/nitro/pull/1192))
  - `future.nativeSWR` ([#1212](https://github.com/unjs/nitro/pull/1212))

### 🔥 Performance

  - Export `defineNitroConfig` from `nitro/config` ([#1174](https://github.com/unjs/nitro/pull/1174))

### 🩹 Fixes

  - Separate `typesDir` from `tsConfigDir` ([#1146](https://github.com/unjs/nitro/pull/1146))
  - **cloudflare:** Expose env from module context ([#1147](https://github.com/unjs/nitro/pull/1147))
  - **proxy:** Append request query params for single proxy route rules ([#1163](https://github.com/unjs/nitro/pull/1163))
  - **vercel, netlify:** Keep default behavior for `static` and `swr` to `isr` mapping ([#1155](https://github.com/unjs/nitro/pull/1155))
  - Apply `chunkFileNames` on windows ([#1189](https://github.com/unjs/nitro/pull/1189))
  - **pkg:** Allow installing on node v20 and above ([#1204](https://github.com/unjs/nitro/pull/1204))

### 💅 Refactors

  - Rename `build` option to `static` ([#1144](https://github.com/unjs/nitro/pull/1144))
  - **cli:** Migrate to citty ([#1157](https://github.com/unjs/nitro/pull/1157))
  - Move swagger/openapi behind experimental flag ([2079cab](https://github.com/unjs/nitro/commit/2079cab))

### 📖 Documentation

  - Fix typo ([#1131](https://github.com/unjs/nitro/pull/1131))
  - Update serverAssets example ([#1156](https://github.com/unjs/nitro/pull/1156))
  - Add edge releases channel ([2793f51](https://github.com/unjs/nitro/commit/2793f51))
  - **get-started:** H2 instead of h3 ([ff3964e](https://github.com/unjs/nitro/commit/ff3964e))
  - **routing:** Add route rules ([46740e6](https://github.com/unjs/nitro/commit/46740e6))
  - **routing:** Add missing import ([30675d4](https://github.com/unjs/nitro/commit/30675d4))
  - Fix syntax issue in guide > storage ([#1180](https://github.com/unjs/nitro/pull/1180))
  - Update ([1e5bb86](https://github.com/unjs/nitro/commit/1e5bb86))
  - Fix typo ([#1185](https://github.com/unjs/nitro/pull/1185))
  - Fix typo ([#1190](https://github.com/unjs/nitro/pull/1190))
  - **vercel:** Add vercel kv storage section ([#1210](https://github.com/unjs/nitro/pull/1210))
  - Update branding ([#1188](https://github.com/unjs/nitro/pull/1188))
  - Update vercel-storage ([ffff9db](https://github.com/unjs/nitro/commit/ffff9db))

### 🏡 Chore

  - Update dependencies ([39d1f27](https://github.com/unjs/nitro/commit/39d1f27))
  - **release:** V2.3.3 ([2d55caf](https://github.com/unjs/nitro/commit/2d55caf))
  - Update dependencies and lockfile ([eea8943](https://github.com/unjs/nitro/commit/eea8943))
  - Update unenv ([ba81902](https://github.com/unjs/nitro/commit/ba81902))
  - Update lockfile ([6a4e57e](https://github.com/unjs/nitro/commit/6a4e57e))
  - Update lockfile ([0793451](https://github.com/unjs/nitro/commit/0793451))
  - **docs:** Move `vercel.json` ([00502d0](https://github.com/unjs/nitro/commit/00502d0))
  - **docs:** Update deps ([4a95c96](https://github.com/unjs/nitro/commit/4a95c96))
  - Update deps ([6b08d37](https://github.com/unjs/nitro/commit/6b08d37))

### ✅ Tests

  - Enable `vercel-edge` test ([7951532](https://github.com/unjs/nitro/commit/7951532))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Daniel Roe <daniel@roe.dev>
- AaronBeaudoin <aaronjbeaudoin@gmail.com>
- Oumar Barry ([@oumarbarry](http://github.com/oumarbarry))
- G-Cyrille 
- 魔王少年 <q267009886.work@gmail.com>
- Iho Somnam <ihosomnam4741@gmail.com>
- Timhanlon <tim@timhanlon.com>

## v2.3.3

[compare changes](https://github.com/unjs/nitro/compare/v2.3.2...v2.3.3)


### 🚀 Enhancements

  - Upgrade to consola v3 (prerelease) ([50e9f8e](https://github.com/unjs/nitro/commit/50e9f8e))

### 🩹 Fixes

  - **prerender:** Show generated routes with error in logs ([8e06f2e](https://github.com/unjs/nitro/commit/8e06f2e))
  - **prerender:** Respect output path from main preset ([#1114](https://github.com/unjs/nitro/pull/1114))

### 📖 Documentation

  - Fix typos in storage and cache guides ([#1086](https://github.com/unjs/nitro/pull/1086))
  - Use unjs logo ([#1104](https://github.com/unjs/nitro/pull/1104))
  - Fix typo in cachedEventHandler options ([#1110](https://github.com/unjs/nitro/pull/1110))
  - Use consistent quotes in the routeRules example ([#1108](https://github.com/unjs/nitro/pull/1108))
  - Fix typo in server assets mount point ([#1119](https://github.com/unjs/nitro/pull/1119))
  - Improve `publicAssets` config details ([#1102](https://github.com/unjs/nitro/pull/1102))

### 🏡 Chore

  - **doc:** Fix small typo in plugin filename ([#1081](https://github.com/unjs/nitro/pull/1081))
  - Update unenv and semver ([363e2ea](https://github.com/unjs/nitro/commit/363e2ea))
  - Update consola ([5d77615](https://github.com/unjs/nitro/commit/5d77615))
  - Bump to consola v3 stable ([ea5ea88](https://github.com/unjs/nitro/commit/ea5ea88))
  - Update dependencies ([39d1f27](https://github.com/unjs/nitro/commit/39d1f27))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Gabriel Cipriano ([@gabrielcipriano](http://github.com/gabrielcipriano))
- Daniel Roe <daniel@roe.dev>
- Yassine El Ouazzani ([@kwarkjes](http://github.com/kwarkjes))
- Inesh Bose 
- Andre Hammons 
- Michael BOUVY <michael.bouvy@gmail.com>

## v2.3.2

[compare changes](https://github.com/unjs/nitro/compare/v2.3.1...v2.3.2)


### 🩹 Fixes

  - Sanitize `statusMessage` of disallowed chars ([#1057](https://github.com/unjs/nitro/pull/1057))
  - **types:** Sync vercel build config types ([#1056](https://github.com/unjs/nitro/pull/1056))
  - **azure:** Support custom baseURL ([#1062](https://github.com/unjs/nitro/pull/1062))
  - **vercel-edge:** Fix route generation ([#1071](https://github.com/unjs/nitro/pull/1071))
  - Mark `options.renderer` as optional ([#1069](https://github.com/unjs/nitro/pull/1069))
  - **types:** Make $Fetch types less complex ([#1059](https://github.com/unjs/nitro/pull/1059))

### 💅 Refactors

  - Add type safety to auto-detected providers ([#1072](https://github.com/unjs/nitro/pull/1072))

### 📖 Documentation

  - Fixed link path ([#1053](https://github.com/unjs/nitro/pull/1053))
  - Fix typo ([#1068](https://github.com/unjs/nitro/pull/1068))
  - **routing:** Add `$fetch` usage note ([#1070](https://github.com/unjs/nitro/pull/1070))

### ❤️  Contributors

- Mahdi Boomeri <mahdi@boomeri.dev>
- Daniel Roe <daniel@roe.dev>
- Shohei Maeda 
- Lucas ([@Draichi](http://github.com/Draichi))
- Nobkd 
- Honza Pobořil <honza@poboril.cz>

## v2.3.1

[compare changes](https://github.com/unjs/nitro/compare/v2.3.0...v2.3.1)


### 🩹 Fixes

  - **types:** Don't simplify type of serialized return ([#1050](https://github.com/unjs/nitro/pull/1050))

### 🏡 Chore

  - Add `codecov.yml` ([6fe7f64](https://github.com/unjs/nitro/commit/6fe7f64))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe <daniel@roe.dev>

## v2.3.0

[compare changes](https://github.com/unjs/nitro/compare/v2.2.3...v2.3.0)


### 🚀 Enhancements

  - **vercel:** Add functions config ([#976](https://github.com/unjs/nitro/pull/976))
  - Add support for `sourceMap` values `hidden`  and `inline` ([#998](https://github.com/unjs/nitro/pull/998))
  - **lagon:** Write `.lagon/config.json` on build ([#996](https://github.com/unjs/nitro/pull/996))
  - **types:** Type $fetch to match json serialization output ([#1002](https://github.com/unjs/nitro/pull/1002))
  - Support base in `useStorage(base?: string)` and improve docs ([#1012](https://github.com/unjs/nitro/pull/1012))
  - **cloudflare-pages:** Rewrite with module syntax ([#1004](https://github.com/unjs/nitro/pull/1004))
  - Allow customising generated tsconfig path ([#1021](https://github.com/unjs/nitro/pull/1021))
  - Support app config ([#1022](https://github.com/unjs/nitro/pull/1022))

### 🩹 Fixes

  - **cloudflare-pages:** Only allow 100 rules combined ([#973](https://github.com/unjs/nitro/pull/973))
  - Only mock `debug` in production ([#990](https://github.com/unjs/nitro/pull/990))
  - Scan middleware and print tree list in ascending alphabetical order ([#981](https://github.com/unjs/nitro/pull/981))
  - **externals:** Correctly specify multiple external dependencies in package.json ([#1013](https://github.com/unjs/nitro/pull/1013))
  - **static:** Use correct format for last modified ([#1017](https://github.com/unjs/nitro/pull/1017))
  - **cache:** Remove rejected cache promise from pending list. ([#995](https://github.com/unjs/nitro/pull/995))
  - Expose `useStorage` with types ([#1026](https://github.com/unjs/nitro/pull/1026))
  - **prerender:** Allow spaces in `href` value regex ([#1030](https://github.com/unjs/nitro/pull/1030))
  - **cache:** Use stale value by default when `swr` is enabled ([#1038](https://github.com/unjs/nitro/pull/1038))
  - Resolve types relative to custom tsconfig path ([#1041](https://github.com/unjs/nitro/pull/1041))
  - Remove duplicate import in generated code ([#1043](https://github.com/unjs/nitro/pull/1043))
  - **types:** Exclude non serializable options from route rules ([#1047](https://github.com/unjs/nitro/pull/1047))

### 💅 Refactors

  - Use unimport built-in type gen for dirs ([#994](https://github.com/unjs/nitro/pull/994))
  - Split out api types ([#1027](https://github.com/unjs/nitro/pull/1027))

### 📖 Documentation

  - Update to latest docus and various improvements ([#975](https://github.com/unjs/nitro/pull/975))
  - Up docus and add back ellipsis ([38b1f34](https://github.com/unjs/nitro/commit/38b1f34))
  - Remove tailwind module ([b3b7e87](https://github.com/unjs/nitro/commit/b3b7e87))
  - **lock:** Update ([7efa31f](https://github.com/unjs/nitro/commit/7efa31f))
  - More improvements ([#985](https://github.com/unjs/nitro/pull/985))
  - Remove fluid layout ([d83f2b6](https://github.com/unjs/nitro/commit/d83f2b6))
  - Update color ([18674c5](https://github.com/unjs/nitro/commit/18674c5))
  - Add unjs icon in footer ([6d36ceb](https://github.com/unjs/nitro/commit/6d36ceb))
  - Update docus ([5fcc127](https://github.com/unjs/nitro/commit/5fcc127))
  - Add button to open on CodeSandBox ([ad120ac](https://github.com/unjs/nitro/commit/ad120ac))
  - Update deployment example for configuration ([#972](https://github.com/unjs/nitro/pull/972))
  - Update dependencies ([c923fed](https://github.com/unjs/nitro/commit/c923fed))
  - **cache:** Improve documentation and `cachedFunction` default options ([#1011](https://github.com/unjs/nitro/pull/1011))
  - Improve readme and getting started ([94d95fa](https://github.com/unjs/nitro/commit/94d95fa))
  - Fix on mobile long path ([1d2f57e](https://github.com/unjs/nitro/commit/1d2f57e))
  - Improvements ([f78619f](https://github.com/unjs/nitro/commit/f78619f))
  - Add `prerender.ignore` description ([#1032](https://github.com/unjs/nitro/pull/1032))
  - Improve configuration page ([554b358](https://github.com/unjs/nitro/commit/554b358))
  - Improve plugins section ([f36a6e0](https://github.com/unjs/nitro/commit/f36a6e0))
  - Update readme ([c58a764](https://github.com/unjs/nitro/commit/c58a764))
  - Update homepage hero ([b848e5a](https://github.com/unjs/nitro/commit/b848e5a))
  - Update meta tags ([70f00e5](https://github.com/unjs/nitro/commit/70f00e5))
  - More improvements ([#1039](https://github.com/unjs/nitro/pull/1039))
  - Update docus version ([f31240b](https://github.com/unjs/nitro/commit/f31240b))
  - Upgrade docus ([a6ce587](https://github.com/unjs/nitro/commit/a6ce587))
  - **deploy/workers:** Fix typo of bundle ([#1046](https://github.com/unjs/nitro/pull/1046))

### 🏡 Chore

  - **readme:** Various improvements ([#1009](https://github.com/unjs/nitro/pull/1009))
  - Fix tests ([#1014](https://github.com/unjs/nitro/pull/1014))
  - **docs:** Use pnpm ([39f117a](https://github.com/unjs/nitro/commit/39f117a))
  - Add autofix-ci action ([8f9c3e2](https://github.com/unjs/nitro/commit/8f9c3e2))
  - Remove old docs commands ([#1042](https://github.com/unjs/nitro/pull/1042))
  - Update dependencies ([02c48f2](https://github.com/unjs/nitro/commit/02c48f2))
  - Maintain lockfile ([ac81602](https://github.com/unjs/nitro/commit/ac81602))
  - Use single undici version for testing ([00743bc](https://github.com/unjs/nitro/commit/00743bc))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe <daniel@roe.dev>
- Felix De Montis <hi@felix.dm>
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))
- Hannes Küttner <kuettner.hannes@gmail.com>
- Julie Saia 
- Ted De Koning 
- Jan Johansen <nizopezo@gmail.com>
- Tobias Diez <code@tobiasdiez.com>
- Elian ☕️ <hello@elian.codes>
- Mahdi Boomeri <mahdi@boomeri.dev>
- Anthony Fu <anthonyfu117@hotmail.com>
- Tom Lienard ([@QuiiBz](http://github.com/QuiiBz))
- Alex Korytskyi ([@alex-key](http://github.com/alex-key))
- Shohei Maeda

## v2.2.3

[compare changes](https://github.com/unjs/nitro/compare/v2.2.2...v2.2.3)


### 🚀 Enhancements

  - Add lagon preset ([#964](https://github.com/unjs/nitro/pull/964))

### 🩹 Fixes

  - **node-cluster:** Default number of workers ([#963](https://github.com/unjs/nitro/pull/963))
  - **cloudflare-pages:** Exclude assets from function call ([#965](https://github.com/unjs/nitro/pull/965))
  - **cloudflare-pages:** Handle assets only for get requests ([#968](https://github.com/unjs/nitro/pull/968))
  - Render json errors for cors requests ([#969](https://github.com/unjs/nitro/pull/969))
  - Use json response for  errors in `/api/` routes ([#971](https://github.com/unjs/nitro/pull/971))

### 💅 Refactors

  - **externals:** Sort `bundledDependencies` keys in output `package.json` ([#967](https://github.com/unjs/nitro/pull/967))

### 📖 Documentation

  - **cloudflare:** Add info regarding `runtimeConfig` and environment variables ([#958](https://github.com/unjs/nitro/pull/958))
  - Prevent ellipsis overflow on small screens ([#956](https://github.com/unjs/nitro/pull/956))
  - **deploy:** Add workers page for edge limitations ([#953](https://github.com/unjs/nitro/pull/953))

### 🏡 Chore

  - **cli:** Mention `prepare` command in usage ([#959](https://github.com/unjs/nitro/pull/959))
  - Update dependencies ([2658072](https://github.com/unjs/nitro/commit/2658072))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Daniel Roe <daniel@roe.dev>
- Jan-Henrik Damaschke <jdamaschke@outlook.de>
- Bogdan Kostyuk <bogdankostyuk12@gmail.com>
- Hminghe ([@hminghe](http://github.com/hminghe))
- Alexander Lichter ([@manniL](http://github.com/manniL))

## v2.2.2

[compare changes](https://github.com/unjs/nitro/compare/v2.2.1...v2.2.2)


### 🩹 Fixes

  - Correct `access-control-allow-methods` cors header name ([#944](https://github.com/unjs/nitro/pull/944))
  - Allow overriding assets `maxAge` using route rules ([db6e6c2](https://github.com/unjs/nitro/commit/db6e6c2))
  - **rollup:** Use mlly as fallback resolver when externals disabled ([#948](https://github.com/unjs/nitro/pull/948))
  - Don't render json response if url contains `/api/` ([#951](https://github.com/unjs/nitro/pull/951))

### 🏡 Chore

  - Update unjs dependencies ([b852c23](https://github.com/unjs/nitro/commit/b852c23))
  - Update jiti dependency ([716dc1a](https://github.com/unjs/nitro/commit/716dc1a))
  - Updare unbuild ([044bb6a](https://github.com/unjs/nitro/commit/044bb6a))

### ✅ Tests

  - **vercel:** Move custom test to additional tests ([fb361f8](https://github.com/unjs/nitro/commit/fb361f8))

### ❤️  Contributors

- Pooya Parsa <pooya@pi0.io>
- Daniel Roe <daniel@roe.dev>

## v2.2.1

[compare changes](https://github.com/unjs/nitro/compare/v2.2.0...v2.2.1)


### 🩹 Fixes

  - **static:** Remove `cache-control` headers when asset is not found ([e3d57fc](https://github.com/unjs/nitro/commit/e3d57fc))
  - Avoid circular imports ([#936](https://github.com/unjs/nitro/pull/936))

### 🏡 Chore

  - Update changelog ([8dde296](https://github.com/unjs/nitro/commit/8dde296))

### ❤️  Contributors

- Pooya Parsa <pyapar@gmail.com>

## v2.2.0

[compare changes](https://github.com/unjs/nitro/compare/v2.1.2...v2.2.0)

### ⭐ What is new?

- Runtime proxy support using route rules ([learn more](https://github.com/unjs/nitro/pull/926))
- Nested fetch calls with incoming headers and context in event context ([learn more](https://github.com/unjs/nitro/pull/930))
- Binary and Raw storage operations support ([learn more](https://github.com/unjs/unstorage/pull/141))
- [Cloudflare] Exposed `event.context.cf` ([learn more](https://github.com/unjs/nitro/pull/927))
- Built-in session support ([learn more](https://github.com/unjs/h3/pull/315))

### 🚀 Enhancements

- Support runtime proxy using route rules ([#926](https://github.com/unjs/nitro/pull/926))
- **cloudflare:** `cacheControl` support for public assets with with `maxAge` ([#922](https://github.com/unjs/nitro/pull/922))
- **cloudflare:** Expose `event.context.cf` ([#927](https://github.com/unjs/nitro/pull/927))
- **firebase:** Use nodejs 18 as default runtime ([#925](https://github.com/unjs/nitro/pull/925))
- Support `event.fetch` and `event.$fetch` ([#930](https://github.com/unjs/nitro/pull/930))
- **vercel:** Auto-detect runtime version ([#879](https://github.com/unjs/nitro/pull/879))

### 🩹 Fixes

- Apply cached rules to overlaping wildcard patterns ([#906](https://github.com/unjs/nitro/pull/906))
- **cloudflare:** Use full mime db ([#933](https://github.com/unjs/nitro/pull/933))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Shohei Maeda
- Luke Nelson <luke@nelson.zone>
- Oleg Khalin
- Daniel Roe <daniel@roe.dev>

## v2.1.2

[compare changes](https://github.com/unjs/nitro/compare/v2.1.1...v2.1.2)

### 🩹 Fixes

- **types:** Allow narrowing of the method option in `NitroFetchOptions` ([#883](https://github.com/unjs/nitro/pull/883))
- **vercel-edge:** Add temporary workaround for ‍`process.cwd‍` usage ([#898](https://github.com/unjs/nitro/pull/898))
- **dev:** Don't overwrite proxy headers if already set ([#896](https://github.com/unjs/nitro/pull/896))
- Provide fallback string values for undefined `runtimeConfig` ([#907](https://github.com/unjs/nitro/pull/907))
- **vercel:** Allow non-glob cache rules to apply to `/` ([#908](https://github.com/unjs/nitro/pull/908))
- **externals:** Use stable dependency tree ([#909](https://github.com/unjs/nitro/pull/909))
- **dev:** Mount `src` and `root` as read-only by default ([#920](https://github.com/unjs/nitro/pull/920))

### 📖 Documentation

- Fix heroku typo ([#900](https://github.com/unjs/nitro/pull/900))
- Fix stormkit images path ([#903](https://github.com/unjs/nitro/pull/903))
- Fix path for server assets ([#917](https://github.com/unjs/nitro/pull/917))

### 🏡 Chore

- Update dependencies ([dbb89a1](https://github.com/unjs/nitro/commit/dbb89a1))
- Update unenv ([91c32c9](https://github.com/unjs/nitro/commit/91c32c9))

### ✅ Tests

- Update fixture ([e7209cb](https://github.com/unjs/nitro/commit/e7209cb))
- Fix type test only ([e1e686f](https://github.com/unjs/nitro/commit/e1e686f))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- SerKo
- Daniel Roe <daniel@roe.dev>
- Renato Lacerda <renato.ac.lacerda@gmail.com>
- Chad Lew
- Mike Laumann Bellika
- Harlan Wilton <harlan@harlanzw.com>
- Dany Sluijk <me@dany.dev>

## v2.1.1

[compare changes](https://github.com/unjs/nitro/compare/v2.1.0...v2.1.1)

### 🩹 Fixes

- Resolve server assets dir relative to `srcDir` ([#893](https://github.com/unjs/nitro/pull/893))
- **prerender:** Encode urls passed to local fetch ([#891](https://github.com/unjs/nitro/pull/891))

### 🏡 Chore

- Update unenv ([b77f082](https://github.com/unjs/nitro/commit/b77f082))
- Format code ([50e1a8f](https://github.com/unjs/nitro/commit/50e1a8f))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Manh-gntvn
- Daniel Roe <daniel@roe.dev>

## v2.1.0

[compare changes](https://github.com/unjs/nitro/compare/v2.0.0...v2.1.0)

### 🚀 Enhancements

- Add `shouldBypassCache` option to cache utils ([#874](https://github.com/unjs/nitro/pull/874))
- **cache:** Allow async `getKey` option ([#878](https://github.com/unjs/nitro/pull/878))

### 🩹 Fixes

- **scan:** Do not dedup middleware handlers ([#880](https://github.com/unjs/nitro/pull/880))
- **externals:** Use portable symlinks ([#882](https://github.com/unjs/nitro/pull/882))

### 📖 Documentation

- **deployment:** Heroku with nginx ([#873](https://github.com/unjs/nitro/pull/873))
- **netlify:** Clarify placement of `_redirects` file ([#870](https://github.com/unjs/nitro/pull/870))
- **digitalocean:** Update deployment guide ([#862](https://github.com/unjs/nitro/pull/862))

### 🏡 Chore

- Update dependencies ([963c587](https://github.com/unjs/nitro/commit/963c587))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Daniel Roe <daniel@roe.dev>
- MiniDigger < Martin>
- Christopher Lis
- Ola Alsaker <ola.alsaker@gmail.com>
- Adeyemi Adetayo <adeyemiadetayo07@gmail.com>

## v2.0.0

[compare changes](https://github.com/unjs/nitro/compare/v2.0.0-rc.1...v2.0.0)

### 🩹 Fixes

- Add node16 compatible type declaration ([#868](https://github.com/unjs/nitro/pull/868))
- **externals:** Improve multi version handling ([#871](https://github.com/unjs/nitro/pull/871))

### ❤️ Contributors

- Pooya Parsa <pyapar@gmail.com>
- Daniel Roe <daniel@roe.dev>

## v2.0.0-rc.1

[compare changes](https://github.com/unjs/nitro/compare/v2.0.0-rc.0...v2.0.0-rc.1)

### 🚀 Enhancements

- **externals:** Apply `production` condition to package.exports ([#867](https://github.com/unjs/nitro/pull/867))
- Enable auto imports from `utils` dir ([#866](https://github.com/unjs/nitro/pull/866))

### 🩹 Fixes

- **prerender:** Update preview command to serve matching routes ([#864](https://github.com/unjs/nitro/pull/864))
- **externals:** Support orphan files in `node_modules` ([#865](https://github.com/unjs/nitro/pull/865))
- Avoid hiding original rollup error message ([a5586f8](https://github.com/unjs/nitro/commit/a5586f8))
- **cache:** Only update cache in storage once per pending request ([#861](https://github.com/unjs/nitro/pull/861))

### 🏡 Chore

- Lint with `eslint --cache` and improve types in `.eslintrc` ([#863](https://github.com/unjs/nitro/pull/863))
- Update dependencies ([c52d256](https://github.com/unjs/nitro/commit/c52d256))
- Remove random import ([246b726](https://github.com/unjs/nitro/commit/246b726))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Yasser Lahbibi <yasser.lahbibi@apenhet.com>
- O-az <github@omaraziz.dev>
- Daniel Roe <daniel@roe.dev>

## v2.0.0-rc.0

[compare changes](https://github.com/unjs/nitro/compare/v1.0.0...v2.0.0-rc.0)

### 🚀 Enhancements

- ⚠️ Upgrade rollup to 3.x ([#580](https://github.com/unjs/nitro/pull/580))
- **types:** Correctly type $fetch based on the method ([#686](https://github.com/unjs/nitro/pull/686))
- **cli:** `prepare` command ([#774](https://github.com/unjs/nitro/pull/774))
- **cache:** Allow setting custom `getKey` for `defineCachedEventHandler` ([#744](https://github.com/unjs/nitro/pull/744))
- **dev:** Support for `/_vfs.json` ([#809](https://github.com/unjs/nitro/pull/809))
- **netlify:** Use esm entrypoint ([#833](https://github.com/unjs/nitro/pull/833))
- ⚠️ Rewrite external copy with multi version hoisting support ([#782](https://github.com/unjs/nitro/pull/782))
- Add `shouldInvalidateCache ` option to cache utils ([#746](https://github.com/unjs/nitro/pull/746))
- `edgio` preset (replacing `layer0`) ([#858](https://github.com/unjs/nitro/pull/858))
- Support `maxAge` for public assets ([#860](https://github.com/unjs/nitro/pull/860))
- Support `staleMaxAge: -1` to always respond stale value ([#857](https://github.com/unjs/nitro/pull/857))

### 🩹 Fixes

- GitHub template ([#712](https://github.com/unjs/nitro/pull/712))
- **deno:** Implement readAsset ([#694](https://github.com/unjs/nitro/pull/694))
- Normalize nitro plugin paths to url in development ([#732](https://github.com/unjs/nitro/pull/732))
- Use file urls for auto-imports in development ([#733](https://github.com/unjs/nitro/pull/733))
- Initialise imports.imports ([#737](https://github.com/unjs/nitro/pull/737))
- Allow optional `output` property in user rollup config ([#751](https://github.com/unjs/nitro/pull/751))
- Accept both upper/lower-case methods ([#752](https://github.com/unjs/nitro/pull/752))
- **prerender:** Check each segment length is less than 255 chars and whole path 1024 ([#757](https://github.com/unjs/nitro/pull/757))
- Include only compressible mime types ([#761](https://github.com/unjs/nitro/pull/761))
- Remove base url before calculating route rules ([#767](https://github.com/unjs/nitro/pull/767))
- **netlify, vercel:** Order route rules from most specific + avoid double-rendering root ([#768](https://github.com/unjs/nitro/pull/768))
- **build:** Correctly formatted fs tree ([#778](https://github.com/unjs/nitro/pull/778))
- **prerender:** Decode urls to allow comma in the `x-nitro-prerender` header ([#799](https://github.com/unjs/nitro/pull/799))
- **build:** Do not override publicAssets ([#817](https://github.com/unjs/nitro/pull/817))
- **dev:** Improve vfs ui ([#802](https://github.com/unjs/nitro/pull/802))
- Resolve and include scanDirs within `node_modules` for auto import ([#812](https://github.com/unjs/nitro/pull/812))
- **netlify, vercel:** Explicit server rendering with disabled cache/swr ([#829](https://github.com/unjs/nitro/pull/829))
- **prerender:** Check link's pathname only for extensions ([#791](https://github.com/unjs/nitro/pull/791))
- **rumtime:** Disable server-timing header via options.timing ([#823](https://github.com/unjs/nitro/pull/823))
- Avoid using file urls for normalized paths in options ([7517293](https://github.com/unjs/nitro/commit/7517293))
- Rollup treeshake is dump ([2ce4edb](https://github.com/unjs/nitro/commit/2ce4edb))
- **externals:** Normalize `inline` and `external` windows paths ([0638f64](https://github.com/unjs/nitro/commit/0638f64))
- **netlify, aws:** Omit cookies from v1 response ([#834](https://github.com/unjs/nitro/pull/834))
- Filter unique scanned handlers ([#807](https://github.com/unjs/nitro/pull/807))
- **nitro:** Resolve server asset dirs relative to `srcDir` ([#825](https://github.com/unjs/nitro/pull/825))
- **public-assets:** Mock readAsset promise properly ([#851](https://github.com/unjs/nitro/pull/851))
- **externals:** Avoid recursive package links ([b77735e](https://github.com/unjs/nitro/commit/b77735e))

### 💅 Refactors

- Upgrade and reduce usage of `fs-extra` ([cfbd029](https://github.com/unjs/nitro/commit/cfbd029))
- Update `event.` to `event.node.` ([#828](https://github.com/unjs/nitro/pull/828))

### 📖 Documentation

- Fix url in auto-imports guide ([#683](https://github.com/unjs/nitro/pull/683))
- Fix spelling of cluster ([#720](https://github.com/unjs/nitro/pull/720))
- Wording change ([#724](https://github.com/unjs/nitro/pull/724))
- Fix readme grammar ([#813](https://github.com/unjs/nitro/pull/813))
- Fix deprecated function in routing example ([#816](https://github.com/unjs/nitro/pull/816))
- Add new render deployment example & steps ([#811](https://github.com/unjs/nitro/pull/811))
- Fix typo in code block ([#830](https://github.com/unjs/nitro/pull/830))
- Add cache base option example & description ([#781](https://github.com/unjs/nitro/pull/781))

### 🏡 Chore

- Lint repository with eslint config and format with prettier ([#739](https://github.com/unjs/nitro/pull/739))
- Limit prettier lint to src ([6a735b1](https://github.com/unjs/nitro/commit/6a735b1))
- Fix type issue ([a60e4bd](https://github.com/unjs/nitro/commit/a60e4bd))
- Fix lint issues ([7ee8e7f](https://github.com/unjs/nitro/commit/7ee8e7f))
- Disable failing api type tests ([1d9102a](https://github.com/unjs/nitro/commit/1d9102a))
- Fix lint issue ([30e4d32](https://github.com/unjs/nitro/commit/30e4d32))
- Add missing parenthesis in header ([#801](https://github.com/unjs/nitro/pull/801))
- Add lint fix command shortcut ([#835](https://github.com/unjs/nitro/pull/835))
- Update lockfile ([bb9ac5b](https://github.com/unjs/nitro/commit/bb9ac5b))

### ✅ Tests

- Add tests for dev server and proxy ([#644](https://github.com/unjs/nitro/pull/644))
- Re-enable api type tests and fix type assertion ([#772](https://github.com/unjs/nitro/pull/772))
- Update fixtures ([a52c832](https://github.com/unjs/nitro/commit/a52c832))

### 🎨 Styles

- Lint code ([15edef0](https://github.com/unjs/nitro/commit/15edef0))

### 🤖 CI

- Run tests against windows as well ([#837](https://github.com/unjs/nitro/pull/837))

#### ⚠️ Breaking Changes

- ⚠️ Upgrade rollup to 3.x ([#580](https://github.com/unjs/nitro/pull/580))
- ⚠️ Rewrite external copy with multi version hoisting support ([#782](https://github.com/unjs/nitro/pull/782))

### ❤️ Contributors

- Pooya Parsa <pooya@pi0.io>
- Yasser Lahbibi <yasser.lahbibi@apenhet.com>
- Harlan Wilton <harlan@harlanzw.com>
- Christian Preston <christianpreston@ymail.com>
- Louis Haftmann
- Daniel Roe <daniel@roe.dev>
- Xin Du (Clark) <clark.duxin@gmail.com>
- Jonas Thelemann <e-mail@jonas-thelemann.de>
- Shoubhit Dash <shoubhit2005@gmail.com>
- Anthony Fu <anthonyfu117@hotmail.com>
- Chambers
- Patrick Schnyder
- Alvar Lagerlöf
- Pascal
- Eduardo San Martin Morote
- Johann Schopplich <mail@johannschopplich.com>
- Nathan Chase <nathan@nathanchase.com>
- Dany Sluijk <me@dany.dev>
- Alexander Lichter <github@lichter.io>
- Nobody5050
- Ʀᴀʏ <nn_201312@163.com>
- Nozomu Ikuta
- James Ray <james.a.ray@jpl.nasa.gov>
- SerKo

## [1.0.0](https://github.com/unjs/nitro/compare/v1.0.0-1...v1.0.0) (2022-11-16)

## [1.0.0-1](https://github.com/unjs/nitro/compare/v1.0.0-0...v1.0.0-1) (2022-11-16)

### Features

- **vercel:** incremental static generation + swr ([#545](https://github.com/unjs/nitro/issues/545)) ([88ce2de](https://github.com/unjs/nitro/commit/88ce2de96ef5bab1e945e539e61581cd33aaf54b))

### Bug Fixes

- upgrade hookable to 5.x ([dc3383b](https://github.com/unjs/nitro/commit/dc3383b4c74f2411600af271ccc30753a727e1fb))

## [1.0.0-0](https://github.com/unjs/nitro/compare/v0.6.2...v1.0.0-0) (2022-11-15)

### ⚠ BREAKING CHANGES

- remove deperecated `autoImport`

- remove deperecated `autoImport` ([c99fa44](https://github.com/unjs/nitro/commit/c99fa441eeb1992af087a6bec85ea868a5eb1e62))

### [0.6.2](https://github.com/unjs/nitro/compare/v0.6.1...v0.6.2) (2022-11-15)

### Bug Fixes

- **cloudflare:** pass raw body instead of parsing it ([#629](https://github.com/unjs/nitro/issues/629)) ([837f894](https://github.com/unjs/nitro/commit/837f894c310ad27854cfa0dc538c6c033e2a3d41))

## 0.4.24

### 🚀 Enhancements

- Add cloudflare-pages preset (#210)
- Support prerendering binary files (#320)
- Opt-in option to compress public assets using `gzip` and `br` (#449)
- Allow specifying wasm plugin options (#450)
- Allow using `extends` alongside with `preset` (6a43985)

### 🩹 Fixes

- **azure:** Fix route name (#430)
- Update types for defu usage (0f241bc)
- Add resolved side-effect for node-fetch-native (#435)
- **aws-lambda:** Join cookies with semicolon (#356)
- **aws-lambda:** Fix normalizeIncomingHeaders (#418)
- **aws-lambda:** Return outgoing cookies on response objects (#357)
- **aws-lambda:** Add `multiValueQueryStringParameters` to aws preset (#398)
- ⚠️ Update unenv to 0.6.x (#438)
- Add code location and codeframe for rollup errors (#406)
- **prerender:** Allow updating route contents (#452)
- **externals:** ⚠️ Fall back to `mlly` resolver in more cases (#431)
- ⚠️ `NITRO_PRESET` should have highest periority (92d711f)

### 💅 Refactors

- ⚠️ Rename options `autoImport` to `imports` (#433)
- Utilize knitwork to generate safe variable names (#447)

### 📖 Documentation

- Migrate to docus (#365)
- Simplify deploy index route (a1d7b17)
- **storage:** Fix typo (#424)

### 🏡 Chore

- Update lock (4ceeee2)
- Narrow plugin override type (b4e24f6)
- Add `@vitest/coverage-c8` (4a5e565)
- Remove unused `@types/jsdom` from dependencies (#429)
- Add vitest config (ab59150)

### 📦 Build

- Expose `package.json` subpath export (d0029c0)
- Use changelogen to bump edge and generate chagelog (679e356)

#### ⚠️ Breaking Changes

- ⚠️ Update unenv to 0.6.x (#438)
- **externals:** ⚠️ Fall back to `mlly` resolver in more cases (#431)
- ⚠️ `NITRO_PRESET` should have highest periority (92d711f)
- ⚠️ Rename options `autoImport` to `imports` (#433)

### ❤️ Contributors

- Ahad Birang
- Alexander Lichter
- Anthony Fu
- Daniel Roe
- Dániel Földi
- Eckhardt (Kaizen) Dreyer
- Julien Huang
- Pooya Parsa
- Sören Schwert
- Tobias Diez
- Yaël Guilloux

### [0.4.24](https://github.com/unjs/nitro/compare/v0.4.23...v0.4.24) (2022-08-12)

### Bug Fixes

- **renderer:** do not use default error fallback ([80081b0](https://github.com/unjs/nitro/commit/80081b0b70d845c29ec24d98573c2179590fafc8))

### [0.4.23](https://github.com/unjs/nitro/compare/v0.4.22...v0.4.23) (2022-08-12)

### Bug Fixes

- **renderer:** handle unhandled errors ([319b277](https://github.com/unjs/nitro/commit/319b27789d5c5a7bb154bd264408dc0689104732))

### [0.4.22](https://github.com/unjs/nitro/compare/v0.4.21...v0.4.22) (2022-08-11)

### Bug Fixes

- fix dist dir check regex ([6cad682](https://github.com/unjs/nitro/commit/6cad6821039328e099b4b1a6cba5f73eba42a111))

### [0.4.21](https://github.com/unjs/nitro/compare/v0.4.20...v0.4.21) (2022-08-11)

### Bug Fixes

- properly resolve dist dir ([d7c65e6](https://github.com/unjs/nitro/commit/d7c65e6c4c2257e044c8c6e0f46b0b1739af1a4d))

### [0.4.20](https://github.com/unjs/nitro/compare/v0.4.19...v0.4.20) (2022-08-11)

### [0.4.19](https://github.com/unjs/nitro/compare/v0.4.18...v0.4.19) (2022-08-11)

### Bug Fixes

- only log unhandled and fatal errors ([#407](https://github.com/unjs/nitro/issues/407)) ([2d5b039](https://github.com/unjs/nitro/commit/2d5b039499f30ed9fbef19495503f95225a59159))

### [0.4.18](https://github.com/unjs/nitro/compare/v0.4.17...v0.4.18) (2022-08-09)

### Bug Fixes

- **netlify:** update rollup output file ([8965bd5](https://github.com/unjs/nitro/commit/8965bd5b72c2599e20e1592175ef154449613358))

### [0.4.17](https://github.com/unjs/nitro/compare/v0.4.16...v0.4.17) (2022-08-09)

### Features

- **netlify:** emit `server.js` to leverage native esm ([#401](https://github.com/unjs/nitro/issues/401)) ([8304ae2](https://github.com/unjs/nitro/commit/8304ae24b5397c1a9dd64d1a5eb25d62069da900))

### [0.4.16](https://github.com/unjs/nitro/compare/v0.4.15...v0.4.16) (2022-08-09)

### Bug Fixes

- **prerender:** prerender `x-nitro` links without crawlLinks option ([46b445f](https://github.com/unjs/nitro/commit/46b445f8b21409540a66973be8fb693cce7812dc))

### [0.4.15](https://github.com/unjs/nitro/compare/v0.4.14...v0.4.15) (2022-08-09)

### Features

- **prerender:** basic ignore support ([a6cbbbe](https://github.com/unjs/nitro/commit/a6cbbbe482243a3d8dc4c3917ec406b74fdb2a8f))

### Bug Fixes

- **prerender:** apply extension filter only to parsed links ([541b0b0](https://github.com/unjs/nitro/commit/541b0b0662017ee8d1f5448a985d27c70a9e6303))
- set `x-nitro-prerender` header as lower-case ([9cee698](https://github.com/unjs/nitro/commit/9cee698c4c12b10cd588efc3234b69acdedb252d))

### [0.4.14](https://github.com/unjs/nitro/compare/v0.4.13...v0.4.14) (2022-08-08)

### Features

- call `render:response` hook for `defineRenderHandler` ([8238f38](https://github.com/unjs/nitro/commit/8238f3801aa959f8707c48e2d5777b54a6a7f74d))

### Bug Fixes

- expose `RenderResponse` and `RenderHandler` types ([e0ec2b2](https://github.com/unjs/nitro/commit/e0ec2b21c706e3882e57f70f0054c84a0e18186a))

### [0.4.13](https://github.com/unjs/nitro/compare/v0.4.12...v0.4.13) (2022-08-08)

### Features

- `defineRenderHandler` ([#395](https://github.com/unjs/nitro/issues/395)) ([758b046](https://github.com/unjs/nitro/commit/758b0463f19764ea799502795b52d6a547b37f81))
- add h3 auto imports preset ([#397](https://github.com/unjs/nitro/issues/397)) ([fbadeb7](https://github.com/unjs/nitro/commit/fbadeb77b867869a6a9268115531fe4d06cb677f))
- auto scan plugins ([0d1cd4d](https://github.com/unjs/nitro/commit/0d1cd4d7638797c7c5ec7fc21c28eca0f81edf01))
- enable response type infer for API routes with params ([#222](https://github.com/unjs/nitro/issues/222)) ([082d58f](https://github.com/unjs/nitro/commit/082d58fd6dc736047d69d41510d63111c7b16cc6))

### Bug Fixes

- **cache:** generate hashed path keys ([6104c54](https://github.com/unjs/nitro/commit/6104c54b946b616d475f970d02b7605fd69211a9))
- **config:** enable dotenv in development ([#347](https://github.com/unjs/nitro/issues/347)) ([ec086c6](https://github.com/unjs/nitro/commit/ec086c6a33f84ace17d2a40b8703d3e1ca97d7ae))
- include dotfiles in public assets ([#361](https://github.com/unjs/nitro/issues/361)) ([8a744fb](https://github.com/unjs/nitro/commit/8a744fbb38bc9b3c6a01d6bbce08c4aa64e7734a))
- **options:** add default aliases and resolve plugins ([f04560b](https://github.com/unjs/nitro/commit/f04560b6b92317a45ed384f61b5c74e9aa1f825d))
- **options:** exclude `buildDir` for auto-imports ([#355](https://github.com/unjs/nitro/issues/355)) ([5219c53](https://github.com/unjs/nitro/commit/5219c53d5c5dd1aacc5a9647831a5131a85078d5))
- **prerender:** remove `baseURL` from generated file paths ([#329](https://github.com/unjs/nitro/issues/329)) ([26c15ca](https://github.com/unjs/nitro/commit/26c15ca02e332643e06949fa4f1dbf7bee8a479d))
- **server-assets:** escape asset file names ([7aaab6d](https://github.com/unjs/nitro/commit/7aaab6d0262ceb6cd8487fc046eb4f866394cfe9))
- sort aliases to ensure priority is given to more specific aliases ([#388](https://github.com/unjs/nitro/issues/388)) ([2a36b1e](https://github.com/unjs/nitro/commit/2a36b1e7390681092d10f0d2c308f7e651fa4e9a))
- update scule to handle runtime config with numbers ([64b740e](https://github.com/unjs/nitro/commit/64b740eea43be93ed5c56da30cd0eaf28305c352)), closes [nuxt/framework#6172](https://github.com/nuxt/framework/issues/6172)
- update unstorage to prevent path traverse ([d5d802f](https://github.com/unjs/nitro/commit/d5d802f3e18257b4dab4c2f8bcc27d455543fe22))
- **worker:** preserve esmodule symbol for dynamic imports ([#354](https://github.com/unjs/nitro/issues/354)) ([0cd5121](https://github.com/unjs/nitro/commit/0cd51217d857b8f7090989d92fe3f1d99f41b0f6))

### [0.4.12](https://github.com/unjs/nitro/compare/v0.4.11...v0.4.12) (2022-07-13)

### Bug Fixes

- **vercel, vercel-edge:** set version as number ([f476cfc](https://github.com/unjs/nitro/commit/f476cfc3e33d0b759e604ff6c0c61ea272e1379a))

### [0.4.11](https://github.com/unjs/nitro/compare/v0.4.10...v0.4.11) (2022-07-13)

### Bug Fixes

- **vercel-edge:** properly set rollup options ([ad5b735](https://github.com/unjs/nitro/commit/ad5b7355d0a4463c0bebd1386ebf2049360bc3e1))

### [0.4.10](https://github.com/unjs/nitro/compare/v0.4.9...v0.4.10) (2022-07-13)

### Features

- `vercel-edge` provider ([#337](https://github.com/unjs/nitro/issues/337)) ([ad2b976](https://github.com/unjs/nitro/commit/ad2b976536c80a423b48facda455efce6b0be365))
- **rollup:** support `development` and `production` export conditions ([f60e6eb](https://github.com/unjs/nitro/commit/f60e6eba50e4db4dc48c5d4f860d61f1cc55613b))
- **vercel:** update to the v3 output api ([#336](https://github.com/unjs/nitro/issues/336)) ([9ac4be2](https://github.com/unjs/nitro/commit/9ac4be267d380851c469a299c9834e9200836d3a))

### Bug Fixes

- call `rollup:before` before generating rollup config ([#335](https://github.com/unjs/nitro/issues/335)) ([292b495](https://github.com/unjs/nitro/commit/292b495e8c1eb620202cd3f1639c59f0a3ce203f))
- **vercel-edge:** use esm default export ([7d251f5](https://github.com/unjs/nitro/commit/7d251f5ff0041cccc308ae7f144dcf2a0017559b))
- **vercel:** add back filesystem route handlers ([bba4064](https://github.com/unjs/nitro/commit/bba4064356bf8340ed8e9eaca0d7deadbcc904fb))
- **vercel:** update output config ([daecb91](https://github.com/unjs/nitro/commit/daecb91ae27e8f77ea0aa7e61a6dc383707a0c49)), closes [#336](https://github.com/unjs/nitro/issues/336)

### [0.4.9](https://github.com/unjs/nitro/compare/v0.4.8...v0.4.9) (2022-06-29)

### Features

- expose router in NitroApp ([#302](https://github.com/unjs/nitro/issues/302)) ([ef5e7f1](https://github.com/unjs/nitro/commit/ef5e7f19cd9d332b4fdb97477d05f6d319b6d2c5))
- **service-worker:** inject registration script to all pages ([#299](https://github.com/unjs/nitro/issues/299)) ([486f236](https://github.com/unjs/nitro/commit/486f236c1e96134c0ee8021ff5d04e93fe819e75))

### Bug Fixes

- get storage mounts type from unstorage ([134f89f](https://github.com/unjs/nitro/commit/134f89f5d0c3045e3435b27c56f89171379c4c81))
- **azure:** pass query params to local call ([#318](https://github.com/unjs/nitro/issues/318)) ([f1fe6cd](https://github.com/unjs/nitro/commit/f1fe6cd9ad9621546eb66a9b8484d1870ae86110))
- export runtime types directly from `nitropack` ([#301](https://github.com/unjs/nitro/issues/301)) ([34b8c4d](https://github.com/unjs/nitro/commit/34b8c4d921b2c6dc708ad6c11cb765935b66b3c0))
- **isPublicAssetURL:** assets should treat as public ([#312](https://github.com/unjs/nitro/issues/312)) ([e165b3b](https://github.com/unjs/nitro/commit/e165b3bdabf8a0082387060df89a1726a3056e0a))
- **prerender:** avoid adding duplicate `baseURL` for local fetch ([#289](https://github.com/unjs/nitro/issues/289)) ([cbc7ba3](https://github.com/unjs/nitro/commit/cbc7ba3835df539116ca6560a85365615af55fbb))
- **types:** allow `autoImport` option to be false ([#296](https://github.com/unjs/nitro/issues/296)) ([3aa3bcf](https://github.com/unjs/nitro/commit/3aa3bcfef4b98528db6b31d620177a57a69afdf4))

### [0.4.8](https://github.com/unjs/nitropack/compare/v0.4.7...v0.4.8) (2022-06-15)

### Bug Fixes

- disable auto import include for scanDirs ([4c057cd](https://github.com/unjs/nitropack/commit/4c057cdd939485c4f416f33d776dadaeb498ed3e)), closes [#277](https://github.com/unjs/nitropack/issues/277)

### [0.4.7](https://github.com/unjs/nitropack/compare/v0.4.6...v0.4.7) (2022-06-14)

### Bug Fixes

- check if socket address/port/family are set ([#287](https://github.com/unjs/nitropack/issues/287)) ([8fb3ad9](https://github.com/unjs/nitropack/commit/8fb3ad93b9c2d0da9a95183818cf228c1b16b99b))
- don't use file url when building prerenderer ([#286](https://github.com/unjs/nitropack/issues/286)) ([2e7c548](https://github.com/unjs/nitropack/commit/2e7c5482c736d8c749d9151bc2f588ebb69a4a83))

### [0.4.6](https://github.com/unjs/nitropack/compare/v0.4.5...v0.4.6) (2022-06-13)

### Features

- update unstorage to 0.5.x ([c5cabbf](https://github.com/unjs/nitropack/commit/c5cabbf6453fe7da46f52a899d2c79fdb56d5b2c))

### [0.4.5](https://github.com/unjs/nitropack/compare/v0.4.4...v0.4.5) (2022-06-12)

### Features

- **dev:** add `x-forwarded` headers ([#247](https://github.com/unjs/nitropack/issues/247)) ([2d50312](https://github.com/unjs/nitropack/commit/2d50312c6f84f4a5ea152556ecd143a0944f9fc1))

### Bug Fixes

- add `scanDirs` to auto-import include ([#277](https://github.com/unjs/nitropack/issues/277)) ([3f8a08e](https://github.com/unjs/nitropack/commit/3f8a08ec6e8421c7311fad8c306fe28586ee83f8))
- append .cache to the key of cached routes/functions ([#249](https://github.com/unjs/nitropack/issues/249)) ([1d4328c](https://github.com/unjs/nitropack/commit/1d4328cceb4245ef01ce789ba6b85a7d4956e22c))
- avoid empty scaned route (resolves [#283](https://github.com/unjs/nitropack/issues/283)) ([a087673](https://github.com/unjs/nitropack/commit/a0876732acadfda2e2c2699a947ea08e6af28d0d))
- **cache:** expose all cache aliases and types ([361d12f](https://github.com/unjs/nitropack/commit/361d12f61a102caac7c9c32ab25d3e662cec80a9))
- **cache:** invalidate entry before calling resolver ([#271](https://github.com/unjs/nitropack/issues/271)) ([7358d5b](https://github.com/unjs/nitropack/commit/7358d5bdc8131f98d1d29aff23dceb4bb702b879))
- **cache:** normalize path keys for `defineCachedEventHandler` ([97625ec](https://github.com/unjs/nitropack/commit/97625ec7fc4d44529fe7e2be16bbeaa3e4f38b98))
- **cloudflare:** use `@cloudflare/wrangler` until we support wrangler 2 ([#265](https://github.com/unjs/nitropack/issues/265)) ([d7fa6ce](https://github.com/unjs/nitropack/commit/d7fa6ce00a97f0573c5524fb0ee4080b2aa58542))
- exclude internal `/_*`, `/api/_*` routes from NitroFetchReqeust type ([#232](https://github.com/unjs/nitropack/issues/232)) ([00aa131](https://github.com/unjs/nitropack/commit/00aa13161f3c8da451614925daf4cd897a838aa3))
- **stormkit:** update request signature ([#264](https://github.com/unjs/nitropack/issues/264)) ([78bf46a](https://github.com/unjs/nitropack/commit/78bf46a324b304516574c538b9b59f50b1f21ed0))

### [0.4.4](https://github.com/unjs/nitropack/compare/v0.4.3...v0.4.4) (2022-05-11)

### Bug Fixes

- update `NitroFetchRequest` type to support `string` type ([#226](https://github.com/unjs/nitropack/issues/226)) ([3542b61](https://github.com/unjs/nitropack/commit/3542b6148a4068e4c2dc74c617fa6e225739bf12))
- update unenv and add `node-fetch-native/polyfill` to `moduleSideEffects` ([e70a9f0](https://github.com/unjs/nitropack/commit/e70a9f0b4333ab4804a4afc31e7c666e4ca77e59))

### [0.4.3](https://github.com/unjs/nitropack/compare/v0.4.2...v0.4.3) (2022-05-10)

### Features

- add `NitroFetchRequest` type and enhance $fetch's request type ([#209](https://github.com/unjs/nitropack/issues/209)) ([57b9ed0](https://github.com/unjs/nitropack/commit/57b9ed0bc4ef15dc36a58ae60810feaedd367c15))
- add `prerender:route` hook ([#213](https://github.com/unjs/nitropack/issues/213)) ([9c9fb34](https://github.com/unjs/nitropack/commit/9c9fb3401246e534374588c681cb77871b0efaaa))
- **prerender:** add preview command ([#217](https://github.com/unjs/nitropack/issues/217)) ([08614c5](https://github.com/unjs/nitropack/commit/08614c50f0365c6d68cf2b18841ac13a3c62cdaa))
- show stack-trace of unhandled errors with `DEBUG` env ([#212](https://github.com/unjs/nitropack/issues/212)) ([b366f3f](https://github.com/unjs/nitropack/commit/b366f3fae0605af75b2eb86839c5a94804a52ffb))

### Bug Fixes

- add missing include path `../../**/*` in generated tsconfig.json ([#205](https://github.com/unjs/nitropack/issues/205)) ([8978404](https://github.com/unjs/nitropack/commit/89784044de3c5d7b518225488684f0b391a372be))
- respect baseURL in prerendering ([#219](https://github.com/unjs/nitropack/issues/219)) ([3e8eddb](https://github.com/unjs/nitropack/commit/3e8eddb20a609c1405d1e531dba2fba3a39384db))
- set built-in storage mounts before nitro init ([d1c6c64](https://github.com/unjs/nitropack/commit/d1c6c64384afdee7424eebc51a4c42978f4dc1c5))

### [0.4.2](https://github.com/unjs/nitropack/compare/v0.4.1...v0.4.2) (2022-05-07)

### Bug Fixes

- **node, preereender:** add handler for `unhandledRejection` ([3319912](https://github.com/unjs/nitropack/commit/3319912635320a8da1022045042b2c041fa6f6c2))
- **prerender:** only crawl known extensions (non or `.json`) ([2dbc8b9](https://github.com/unjs/nitropack/commit/2dbc8b9b0d9122a797009e31b1303b3fc625d0ac))

### [0.4.1](https://github.com/unjs/nitropack/compare/v0.4.0...v0.4.1) (2022-05-06)

### Bug Fixes

- support fallback for `import.meta` per chunk ([5a83ec6](https://github.com/unjs/nitropack/commit/5a83ec62c4db52b11c88a18baa5c16bca3f71b4f))
- use distinct prefix for lazy handler imports ([0cc7be1](https://github.com/unjs/nitropack/commit/0cc7be13a1ec125d888bc40f00be280bdc81c8fe))

## [0.4.0](https://github.com/unjs/nitropack/compare/v0.3.12...v0.4.0) (2022-05-05)

### ⚠ BREAKING CHANGES

- **cache:** only accept event handler for `defineCachedEventHandler`
- **prerender:** write html files to subfolder (resolves #166)

### Features

- `nitro.storage` ([e1c234e](https://github.com/unjs/nitropack/commit/e1c234eaa59db02bbc76d5b0272b153bb2a238ae))
- add `X-Nitro-Prerender` header to detect prerendering ([11e732b](https://github.com/unjs/nitropack/commit/11e732b6d3c53ca2d8b7e09be9f0da4550eb5d0c))
- allow explicit middleware handlers ([23d8cde](https://github.com/unjs/nitropack/commit/23d8cde6942c051872aa4286b49ee7ee88ee9254))
- **cache:** only accept event handler for `defineCachedEventHandler` ([7e72b8f](https://github.com/unjs/nitropack/commit/7e72b8f327fb0141bce32d2b0b50e357ec6a7a07))
- expose all assets to `nitro.vfs` and `/_vfs` endpoint (resolves [#173](https://github.com/unjs/nitropack/issues/173)) ([9bf2d71](https://github.com/unjs/nitropack/commit/9bf2d710583d5b6297a1afed1c3d33b8c8826e50))
- extend prerender links from `X-Nitro-Prerender` (resolves [#115](https://github.com/unjs/nitropack/issues/115)) ([9423524](https://github.com/unjs/nitropack/commit/94235246d155c13f886a26a24162d6fd6e9c67d5))
- named wildcard params ([233e024](https://github.com/unjs/nitropack/commit/233e024c75940c26c9113b374bbd7e35a8e0a31f))
- **prerender:** write html files to subfolder (resolves [#166](https://github.com/unjs/nitropack/issues/166)) ([cdcd35a](https://github.com/unjs/nitropack/commit/cdcd35adf3e4f1d3902605f97559c0dcf6d0febf))
- **rollup:** allow edit of commonJs plugin options ([#187](https://github.com/unjs/nitropack/issues/187)) ([c7759e9](https://github.com/unjs/nitropack/commit/c7759e90a67987ef20e5fadacc354f9934ef9cc3))
- **rollup:** fail build when externals are not allowed and cannot resolve id ([ff2dd44](https://github.com/unjs/nitropack/commit/ff2dd443641ad2b72b1e22c2075a20099222e2c6))
- universal `import.meta` (resolves [#181](https://github.com/unjs/nitropack/issues/181)) ([929322b](https://github.com/unjs/nitropack/commit/929322b5c6e3afd9f631613f07dcdd4e81a88dab))
- update unenv ([04e2f26](https://github.com/unjs/nitropack/commit/04e2f2605b899e20a151efb62a6f81ccf1cfbc4e))

### Bug Fixes

- **cache:** preserve event context (resolves [#189](https://github.com/unjs/nitropack/issues/189)) ([6cdbc4a](https://github.com/unjs/nitropack/commit/6cdbc4ac72dbec999d19eb3750ce392a462610a6))
- enable lazy only when explicitly set (enable for api and rotues by default) ([247cfca](https://github.com/unjs/nitropack/commit/247cfca88e2f9aea529d23fc42af4e833f7c7cc2))
- **handlers:** respect default value for lazy ([89da30a](https://github.com/unjs/nitropack/commit/89da30a7740398fe5531f223f15357dcc9ddb807))
- improve bundled storage ([#179](https://github.com/unjs/nitropack/issues/179)) ([d4cb863](https://github.com/unjs/nitropack/commit/d4cb863c46047564d170bb183444e5bcdcb619c9))
- **prerender:** allow all extensions (resolves [#190](https://github.com/unjs/nitropack/issues/190)) ([4b15520](https://github.com/unjs/nitropack/commit/4b15520f18f62108e9260fbc9a2881f838710fda))
- **prerender:** support relative urls ([970286d](https://github.com/unjs/nitropack/commit/970286dacfcf8336f9c4d46c3f774d32bd0dfbca))
- **rollup:** enable `preferBuiltins` only for node targets ([32f598a](https://github.com/unjs/nitropack/commit/32f598afaec65014e499980baa18cd7bb331b6ce))
- **rollup:** respect `rollupConfig` options to override default config ([43b1d02](https://github.com/unjs/nitropack/commit/43b1d023117060a216c290888c71297c3b3376f3))
- **rollup:** set `NODE_ENV` to `prerender` when prerendering ([2b7209a](https://github.com/unjs/nitropack/commit/2b7209aab8667d0470949b636ff383d85057a08d))
- **worker:** use `iife` format by default ([6c8cae7](https://github.com/unjs/nitropack/commit/6c8cae7e25c4a24e5d85e8e322248e2beebedef3))

### [0.3.12](https://github.com/unjs/nitropack/compare/v0.3.11...v0.3.12) (2022-05-02)

### Bug Fixes

- add missing `prefixStorage` import for bundled storage ([defa4de](https://github.com/unjs/nitropack/commit/defa4defeae038a01464821969986240b9288088))
- **storage:** skip bundled storage for dev and prerender ([31a3957](https://github.com/unjs/nitropack/commit/31a3957757614c4db61c271ecdb7c9c8f4e22d4a))

### [0.3.11](https://github.com/unjs/nitropack/compare/v0.3.10...v0.3.11) (2022-05-02)

### Bug Fixes

- **storage:** remove unused `prefixStorage` import ([7376c6d](https://github.com/unjs/nitropack/commit/7376c6dbc31cf277828160c7e22b4213fe142780))
- **storage:** use `devStorage` for dev and prerender ([93c4d85](https://github.com/unjs/nitropack/commit/93c4d851fd08b6b2fe9952f1ea833ed36899273a))

### [0.3.10](https://github.com/unjs/nitropack/compare/v0.3.9...v0.3.10) (2022-05-02)

### Features

- experimental bundled storage ([#160](https://github.com/unjs/nitropack/issues/160)) ([308e7c7](https://github.com/unjs/nitropack/commit/308e7c7d869345565747f9d986a6e77e9789cc1d))

### Bug Fixes

- **deps:** pin `@rollup/plugin-node-resolve` due to cloudflare issue ([3ecb813](https://github.com/unjs/nitropack/commit/3ecb813e72007ad4a8bb14f1b0892cee9761c66f))

### [0.3.9](https://github.com/unjs/nitropack/compare/v0.3.8...v0.3.9) (2022-05-02)

### Bug Fixes

- add cached shortcuts to the imports ([#162](https://github.com/unjs/nitropack/issues/162)) ([bf6d208](https://github.com/unjs/nitropack/commit/bf6d208866946b4251f7b5922128c03e6117bacd))
- **cloudflare:** normalize incoming & outgoing headers ([#171](https://github.com/unjs/nitropack/issues/171)) ([abda66b](https://github.com/unjs/nitropack/commit/abda66b65bca708aee731cc4b9f1ba493fc356f2))

### [0.3.8](https://github.com/unjs/nitropack/compare/v0.3.7...v0.3.8) (2022-04-27)

### Features

- improve raw asset handling ([#158](https://github.com/unjs/nitropack/issues/158)) ([a68d3d2](https://github.com/unjs/nitropack/commit/a68d3d25da90c1a131ff4de85b9d3160067baa90))

### Bug Fixes

- **cache:** replace magage typo by maxage ([#150](https://github.com/unjs/nitropack/issues/150)) ([07d8ced](https://github.com/unjs/nitropack/commit/07d8cedbf9d9d2105929f753d12e76254b31b204))
- replace `global.` in fewer instances ([#155](https://github.com/unjs/nitropack/issues/155)) ([73db5c9](https://github.com/unjs/nitropack/commit/73db5c9e0de1baffec93a47bee85c88a33c8d609))
- support patch method auto-scanning ([#153](https://github.com/unjs/nitropack/issues/153)) ([01801c2](https://github.com/unjs/nitropack/commit/01801c2e7a17effce8ff84d2cc6c5a488cce61a6))

### [0.3.7](https://github.com/unjs/nitropack/compare/v0.3.6...v0.3.7) (2022-04-25)

### Bug Fixes

- **rollup:** prepend `node_modules` to `moduleDirectories` ([458ff57](https://github.com/unjs/nitropack/commit/458ff5793a6d088c5813a05173a35675f453267d)), closes [#136](https://github.com/unjs/nitropack/issues/136)

### [0.3.6](https://github.com/unjs/nitropack/compare/v0.3.5...v0.3.6) (2022-04-22)

### Bug Fixes

- manually merge runtime config with env ([#143](https://github.com/unjs/nitropack/issues/143)) ([1be5ac2](https://github.com/unjs/nitropack/commit/1be5ac2e89035ce98f50edaa8e7c79ba4e974adf))
- respect `sourceMap` option ([#141](https://github.com/unjs/nitropack/issues/141)) ([e5ab741](https://github.com/unjs/nitropack/commit/e5ab741a1b96f91b62da4341ab3ceffd304e0f90))
- wrap dynamic import in prerender to fix windows build failure ([#134](https://github.com/unjs/nitropack/issues/134)) ([2be8aaf](https://github.com/unjs/nitropack/commit/2be8aafd04c180de861010b263d551cdb049e7b6))

### [0.3.5](https://github.com/unjs/nitropack/compare/v0.3.4...v0.3.5) (2022-04-20)

### Bug Fixes

- **node-server:** default production host to `0.0.0.0` ([b7c7193](https://github.com/unjs/nitropack/commit/b7c719349a0ee399a525937abb5905e50b0351f2))

### [0.3.4](https://github.com/unjs/nitropack/compare/v0.3.3...v0.3.4) (2022-04-19)

### Bug Fixes

- **prerender:** disallow routes longer than 250 chars ([c736de0](https://github.com/unjs/nitropack/commit/c736de038f186589237b413eb6ed9bd4e163189c))
- **prerender:** only use pathnames ([7cc02c9](https://github.com/unjs/nitropack/commit/7cc02c972c928537c2a19e75cfc53f7ea2e33ac6))

### [0.3.3](https://github.com/unjs/nitropack/compare/v0.3.2...v0.3.3) (2022-04-19)

### Bug Fixes

- provide compatibility `#nitro` as a virtual module ([6a798c6](https://github.com/unjs/nitropack/commit/6a798c6a1ac77c5c53f33838047f3ab5c7560787))

### [0.3.2](https://github.com/unjs/nitropack/compare/v0.3.1...v0.3.2) (2022-04-19)

### Features

- provide `#imports` alias and `#nitro` for backward compatibility ([ef2f216](https://github.com/unjs/nitropack/commit/ef2f216e48c54404c335c7995efcec85f7759c66))

### [0.3.1](https://github.com/unjs/nitropack/compare/v0.3.0...v0.3.1) (2022-04-19)

### Bug Fixes

- **node-server:** fix typo in import ([b5bd30b](https://github.com/unjs/nitropack/commit/b5bd30b4c0484f862dc9f78403248c686a6fb445))
- **prerenderer:** switch back to simple queue ([b7a65eb](https://github.com/unjs/nitropack/commit/b7a65eb0765e5b5a5e0644f61cf654f46565b410))

## [0.3.0](https://github.com/unjs/nitropack/compare/v0.2.11...v0.3.0) (2022-04-19)

### ⚠ BREAKING CHANGES

- rename `#nitro` to `#internal/nitro`
- remove `nitro:` prefix from hook names

### Features

- add layer0 preset ([b748da3](https://github.com/unjs/nitropack/commit/b748da36a1deb4b4550c865d64a1f97a4fb50211))
- **cache:** add `staleMaxAge` option for caching header ([#116](https://github.com/unjs/nitropack/issues/116)) ([8ff6836](https://github.com/unjs/nitropack/commit/8ff6836805842a7649d12f4a450d142cf329fa08))
- netlify edge function preset ([feebf8f](https://github.com/unjs/nitropack/commit/feebf8f6fda08873452c826e89327db380a495c7))
- stormkit preset ([#103](https://github.com/unjs/nitropack/issues/103)) ([7316385](https://github.com/unjs/nitropack/commit/7316385ea921fd33f89e4743cf3058898537f454))

### Bug Fixes

- default fetch baseURL to runtime nitro base ([#122](https://github.com/unjs/nitropack/issues/122)) ([00a15c1](https://github.com/unjs/nitropack/commit/00a15c159b2f3601d7fc3c53cc7ee423f910cf8c))
- **externals:** normalize output paths to flat strcture ([a7f451f](https://github.com/unjs/nitropack/commit/a7f451fddf6bf7031b24eed14e707430271deda9)), closes [#106](https://github.com/unjs/nitropack/issues/106)
- force preset to `nitro-dev` when `dev` flag used ([94fc531](https://github.com/unjs/nitropack/commit/94fc53118e411bc538d61dacac70d1d1183b5004)), closes [#121](https://github.com/unjs/nitropack/issues/121)

- remove `nitro:` prefix from hook names ([ac2f0aa](https://github.com/unjs/nitropack/commit/ac2f0aa30ff1a584a2144f879d0d8caacece0add))
- rename `#nitro` to `#internal/nitro` ([944a348](https://github.com/unjs/nitropack/commit/944a34822c8eb4a4f6e31f285f8a64694372d657))

### [0.2.11](https://github.com/unjs/nitropack/compare/v0.2.10...v0.2.11) (2022-04-15)

### Bug Fixes

- **prerender:** add `.html` for implicit html routes ([1b7bc8c](https://github.com/unjs/nitropack/commit/1b7bc8c999004b64d2c063c8944928d9c6337e07))

### [0.2.10](https://github.com/unjs/nitropack/compare/v0.2.9...v0.2.10) (2022-04-14)

### Features

- **cache:** rewrite `defineCachedEventHandler` ([d7512be](https://github.com/unjs/nitropack/commit/d7512befd26880232c767d5fc135b4db86091853))
- improve prerenderer ([5457a01](https://github.com/unjs/nitropack/commit/5457a010c188f412bed0914c44db27cbe02a664b))

### [0.2.9](https://github.com/unjs/nitropack/compare/v0.2.8...v0.2.9) (2022-04-14)

### Bug Fixes

- **prerender:** only extract relative links ([#112](https://github.com/unjs/nitropack/issues/112)) ([b61caf7](https://github.com/unjs/nitropack/commit/b61caf78f14e772edd229d8bbf49d695bf4d8f88))

### [0.2.8](https://github.com/unjs/nitropack/compare/v0.2.7...v0.2.8) (2022-04-13)

### Features

- add render, digital-ocean and heroku presets ([#55](https://github.com/unjs/nitropack/issues/55)) ([b77ef27](https://github.com/unjs/nitropack/commit/b77ef277679e50565c1f9c47d0fd849cf0e1940c))

### Bug Fixes

- **dev:** remove global serve-placeholder ([7b4f340](https://github.com/unjs/nitropack/commit/7b4f340492ba452c9c2f9261e86925acf00dbd21)), closes [#94](https://github.com/unjs/nitropack/issues/94)
- **dev:** watch routes changes to full reload ([9d1ff93](https://github.com/unjs/nitropack/commit/9d1ff9307b32062fff786a80d0e6545f890cdc8e))
- escape regex for wild-card route matcher ([41e27b4](https://github.com/unjs/nitropack/commit/41e27b466ec29bdba0ecda4961be146c4a630333)), closes [nuxt/framework#4313](https://github.com/nuxt/framework/issues/4313)
- remove `/index` from generated routes at last ([09cad09](https://github.com/unjs/nitropack/commit/09cad098cbed3591f3cede0ac65b38a5397ff9c4)), closes [nuxt/framework#4314](https://github.com/nuxt/framework/issues/4314)
- **server-assets:** assets behavior ([#105](https://github.com/unjs/nitropack/issues/105)) ([e21134c](https://github.com/unjs/nitropack/commit/e21134c172961026e62b4840fd9005bbe03c5077))

### [0.2.7](https://github.com/unjs/nitropack/compare/v0.2.6...v0.2.7) (2022-04-12)

### Bug Fixes

- **rollup:** also match moduleSideEffects with full path ([ce2e898](https://github.com/unjs/nitropack/commit/ce2e898beaaa32776d1dabe1d96a3debea2bbabf))

### [0.2.6](https://github.com/unjs/nitropack/compare/v0.2.5...v0.2.6) (2022-04-12)

### Bug Fixes

- resolve to tested version of `defu` and `h3` ([ba2e237](https://github.com/unjs/nitropack/commit/ba2e237b5dc95ba9681dc33afd2e1898638e16f8))

### [0.2.5](https://github.com/unjs/nitropack/compare/v0.2.4...v0.2.5) (2022-04-12)

### Features

- allow overriding nested runtime config ([#65](https://github.com/unjs/nitropack/issues/65)) ([27fb68b](https://github.com/unjs/nitropack/commit/27fb68b0411b967069e3eb60a762b12a7b979ea2))
- support custom error and dev error handler ([#76](https://github.com/unjs/nitropack/issues/76)) ([cb6a84c](https://github.com/unjs/nitropack/commit/cb6a84c37fc1e4686b1e98a7320e44b1d7ed90d9))

### Bug Fixes

- allow overriding nested variables ([#75](https://github.com/unjs/nitropack/issues/75)) ([d7bfc96](https://github.com/unjs/nitropack/commit/d7bfc9660c8a9662b13cfb24342d3ccc9289d46a))
- allow users to override nitro error ([#58](https://github.com/unjs/nitropack/issues/58)) ([aa660c7](https://github.com/unjs/nitropack/commit/aa660c7faf92ddceee7b003c89adf1df7068bf93))

### [0.2.4](https://github.com/unjs/nitropack/compare/v0.2.3...v0.2.4) (2022-04-11)

### Bug Fixes

- **prerender:** use pathname from extracted links only ([#74](https://github.com/unjs/nitropack/issues/74)) ([b9271d7](https://github.com/unjs/nitropack/commit/b9271d72a182839eadc49e0c32d2beb64f1da37b))

### [0.2.3](https://github.com/unjs/nitropack/compare/v0.2.2...v0.2.3) (2022-04-11)

### Features

- use `std-env` to detect provider ([#72](https://github.com/unjs/nitropack/issues/72)) ([e78f598](https://github.com/unjs/nitropack/commit/e78f5984dd9b308d86adba8410b6b30336d07945))

### Bug Fixes

- always apply `#build` windows fix when `externals.trace` is disabled ([1ec2ee4](https://github.com/unjs/nitropack/commit/1ec2ee4cf3dfd355a2b7d8d6d7aa5de6dcb51b7c))

### [0.2.2](https://github.com/unjs/nitropack/compare/v0.2.1...v0.2.2) (2022-04-11)

### Bug Fixes

- disable externals with explicit flag ([2e5de6c](https://github.com/unjs/nitropack/commit/2e5de6cf37f4954cbd1492212f4537c44ab681e4)), closes [nuxt/framework#226](https://github.com/nuxt/framework/issues/226)
- normalize `#build` windows path for dev and prerender presets ([#70](https://github.com/unjs/nitropack/issues/70)) ([ec5db11](https://github.com/unjs/nitropack/commit/ec5db11f7eef215d0337401b91c71e1946a30664))

### [0.2.1](https://github.com/unjs/nitropack/compare/v0.2.0...v0.2.1) (2022-04-07)

### Bug Fixes

- use file:// for windows #build alias on dev ([077b511](https://github.com/unjs/nitropack/commit/077b5118742c822223fa110e0fd19f36b8616b02))

## [0.2.0](https://github.com/unjs/nitropack/compare/v0.1.4...v0.2.0) (2022-04-07)

### ⚠ BREAKING CHANGES

- remove `nitro:document` hook
- remove `views/app.template.html` from `build` logic

- remove `nitro:document` hook ([1feb644](https://github.com/unjs/nitropack/commit/1feb6444ccc9e90668a1adc13a48198891f98f2a))
- remove `views/app.template.html` from `build` logic ([0939233](https://github.com/unjs/nitropack/commit/09392330a8f13a51e245c0346e7a4aa66dae1b85))

### [0.1.4](https://github.com/unjs/nitropack/compare/v0.1.3...v0.1.4) (2022-04-07)

### Bug Fixes

- issues with firebase dependencies ([#48](https://github.com/unjs/nitropack/issues/48)) ([3498d7d](https://github.com/unjs/nitropack/commit/3498d7d369df206f04e946335e4798ad60bcf2e6))

### [0.1.3](https://github.com/unjs/nitropack/compare/v0.1.2...v0.1.3) (2022-04-07)

### Features

- allow user configured dynamic virtual imports ([046d090](https://github.com/unjs/nitropack/commit/046d0901903bb09e2e1e3812eb433e7cfa9c6141))
- improve error pages ([209688f](https://github.com/unjs/nitropack/commit/209688f90c72948073fe5165f03b2ef81acf865e))

### Bug Fixes

- avoid replaceAll for node 14 compatibility ([#42](https://github.com/unjs/nitropack/issues/42)) ([e229115](https://github.com/unjs/nitropack/commit/e229115454ad29826f4e27f85edbc62d22574309))
- **externals:** check for explicit externals ([b4ced48](https://github.com/unjs/nitropack/commit/b4ced481f3579141106f90c1f6c03bcad9a6f117))
- **externals:** improve fallback error handling ([6b355ca](https://github.com/unjs/nitropack/commit/6b355ca6f767e9bce95ea018a84959cb2760db63))
- update azure SWA preset and update node versions detection ([#43](https://github.com/unjs/nitropack/issues/43)) ([19c784b](https://github.com/unjs/nitropack/commit/19c784b297ef7b1a618ca2bac1656462802df144))
- update firebase output for package.json ([#45](https://github.com/unjs/nitropack/issues/45)) ([7700500](https://github.com/unjs/nitropack/commit/7700500d04c333858b94be796b6385e08a4dce70))

### [0.1.2](https://github.com/unjs/nitropack/compare/v0.1.1...v0.1.2) (2022-04-07)

### Bug Fixes

- update azure functions preset ([#41](https://github.com/unjs/nitropack/issues/41)) ([c552906](https://github.com/unjs/nitropack/commit/c552906b847bf1698ee6b9cb9d424aef7fc33832))

### [0.1.1](https://github.com/unjs/nitropack/compare/v0.1.0...v0.1.1) (2022-04-07)

### Features

- `routes/` directory ([2f96340](https://github.com/unjs/nitropack/commit/2f963403b2bd39493c1dc918ec1ef0a534185c06))
- method support for rotue handlers ([da35ab1](https://github.com/unjs/nitropack/commit/da35ab19aeaa33ea7f4ef52f9ee08bdec931fba5))
- register `[...].ext` as catch-all ([2e2e283](https://github.com/unjs/nitropack/commit/2e2e28342375dd03c84020085b488af67406553d))

### Bug Fixes

- also check for assets paths for `isPublicAssetURL` ([4170f65](https://github.com/unjs/nitropack/commit/4170f65056590075424f4d5cd5e14f9d1ad3ceed))
- always enable publicAssets plugin ([a78e1be](https://github.com/unjs/nitropack/commit/a78e1beb07009b59df437b80e9883db04d9d24f4))
- **cli:** prerender before main build ([9388b7d](https://github.com/unjs/nitropack/commit/9388b7dea3af8c0ac34e1ed5315d63f7e191a4ba))
- mock readAsset when serveStatic is disabled ([e95b9d9](https://github.com/unjs/nitropack/commit/e95b9d9e84b6e589a2db4a91b523eaad60654994))
- **service-worker:** remove `_server` prefix ([60ae8ba](https://github.com/unjs/nitropack/commit/60ae8ba5383dcceae52bf4094e4a3cc6a541d634))
- update unenv to fix proxy mock issues ([fefd2e9](https://github.com/unjs/nitropack/commit/fefd2e9216da0b0287ed082578c34045bb62c309))

## 0.1.0 (2022-04-07)

### ⚠ BREAKING CHANGES

- use `app.baseURL` runtime config for framework agnostic usage
- expose `nitroApp` to entries
- simplify storage options
- drop paths and support top level `baseURL` option
- migrate to h3 0.5x with events API (#23)
- add `engines.node` field and node.js version check (#1197)

### Features

- `@nuxt/meta` module for head rendering ([#179](https://github.com/unjs/nitropack/issues/179)) ([1a76f60](https://github.com/unjs/nitropack/commit/1a76f6057d893d26e41960c0b12d9cf1e9496764))
- `h3` auto imports preset ([0661fa9](https://github.com/unjs/nitropack/commit/0661fa988e0dafff8a700ee0c1cb10137914ccb5))
- `nitro.close()` ([c1560d0](https://github.com/unjs/nitropack/commit/c1560d0a7bc063a487e924e340d50202ef9c6fa0))
- add `engines.node` field and node.js version check ([#1197](https://github.com/unjs/nitropack/issues/1197)) ([a0ff933](https://github.com/unjs/nitropack/commit/a0ff933f75e4c07ac62bf1962ab3a1520fe2f094))
- add `process.dev` ([#16](https://github.com/unjs/nitropack/issues/16)) ([68fc5b3](https://github.com/unjs/nitropack/commit/68fc5b32524964a5d899e39d3a5a090eb0d1e465))
- add `runtime/client` for $fetch polyfill ([#11](https://github.com/unjs/nitropack/issues/11)) ([e241e3d](https://github.com/unjs/nitropack/commit/e241e3d770127d325ba6bfbeb74bb1adb0552e1a))
- add $fetch to client ([48cf97c](https://github.com/unjs/nitropack/commit/48cf97c4244680c60af99ffee7e834e5cf604070))
- add azure functions preset ([#45](https://github.com/unjs/nitropack/issues/45)) ([15b20a5](https://github.com/unjs/nitropack/commit/15b20a5c22684f49bf18931427a0ab45d4744ab3))
- add basic html error ([d090aac](https://github.com/unjs/nitropack/commit/d090aac99d741bbf5b965988084111aedc594d2f))
- add firebase preset ([#100](https://github.com/unjs/nitropack/issues/100)) ([750fa76](https://github.com/unjs/nitropack/commit/750fa76a33a5a2bc344bb1d0a01441f83da80f25))
- add hint to dynamic require for netlify ([5fade11](https://github.com/unjs/nitropack/commit/5fade11011fe4878f61f7d4ac986926540fc19fb))
- add serve-placeholder ([689aad0](https://github.com/unjs/nitropack/commit/689aad00155e5c153e5ee015493c81f3fb039b83))
- add support for Azure static web apps ([#92](https://github.com/unjs/nitropack/issues/92)) ([9a5ae67](https://github.com/unjs/nitropack/commit/9a5ae67e9b07ec3948703286eb207e80197a93a5))
- add support for vite build (with vite-format manifest) ([#450](https://github.com/unjs/nitropack/issues/450)) ([002469a](https://github.com/unjs/nitropack/commit/002469aae22aa965955bf9424597c4aca09b2352))
- allow custom error handling ([#30](https://github.com/unjs/nitropack/issues/30)) ([ac1b093](https://github.com/unjs/nitropack/commit/ac1b0936f712d6138f4add5e2dcbca63d3ad68e2))
- allow disabling tsconfig generation ([f30a026](https://github.com/unjs/nitropack/commit/f30a02667ca94415045a7071ed44c5f2196809b4))
- allow overriding runtime config with `NITRO_` or an alternative speficied with `NITRO_ENV_PREFIX_ALT` ([a27d529](https://github.com/unjs/nitropack/commit/a27d52908848edb80f003c448daf366c98ceffd1))
- auto imports for `useConfig` and `useStorage` ([5b2c950](https://github.com/unjs/nitropack/commit/5b2c950209821c4d74bb68be6892ca4ec9ff3d40))
- automatically mock unresolved externals ([dac74e1](https://github.com/unjs/nitropack/commit/dac74e1b5c848bb13fcdf37c15c6e3f4b6c7fa00))
- aws APIGatewayProxyEventV2 support ([d135f01](https://github.com/unjs/nitropack/commit/d135f01be8303089a0f010d69e57cc44ad08b792))
- basic multi dir support ([376d349](https://github.com/unjs/nitropack/commit/376d3496ec08633aed7ad8fb8488cd3551168b4d))
- basic support for netlify_builder target ([#18](https://github.com/unjs/nitropack/issues/18)) ([4f90f95](https://github.com/unjs/nitropack/commit/4f90f959386e5a659401650be7a0f61934333afb))
- better error handler ([d8cf235](https://github.com/unjs/nitropack/commit/d8cf2355b0e13c121df4084fbd5d2be7c9d7ad2a))
- better process polyfill ([f06a437](https://github.com/unjs/nitropack/commit/f06a4376c35e1afec372fd6bd4ad9c79be76e732))
- **browser:** inject script to js template ([51712ad](https://github.com/unjs/nitropack/commit/51712ad0d2e18294a03a941c67611a2df1c3f06b))
- cache api ([e9a44f5](https://github.com/unjs/nitropack/commit/e9a44f57f6c7cbacad35e7be25f278a5fbb2c67e))
- create `nitro.logger` to control verbosity ([a91fd52](https://github.com/unjs/nitropack/commit/a91fd5218253c8a9e3a2c62d9810462b1428f171))
- define nitro `#storage` and `#assets` types ([#1377](https://github.com/unjs/nitropack/issues/1377)) ([cf78609](https://github.com/unjs/nitropack/commit/cf78609d4c56ea996cb002f144f391c6ee93f829))
- **deps:** update all non-major dependencies ([#2252](https://github.com/unjs/nitropack/issues/2252)) ([1b2e92e](https://github.com/unjs/nitropack/commit/1b2e92e671adb5fc84fd673bdfa15b4f08a563d3))
- detect target ([ea250b3](https://github.com/unjs/nitropack/commit/ea250b36a4d86914bef58c88d47c2fce1b424b3d))
- dev server watch ([3eb6c20](https://github.com/unjs/nitropack/commit/3eb6c20a1a1d3eb23ae0d1a775829363da0d4b8b))
- drop paths and support top level `baseURL` option ([913f3d8](https://github.com/unjs/nitropack/commit/913f3d8904f26d68ce7786a0f728371777faca76))
- dynamic chunk importer ([0f179ab](https://github.com/unjs/nitropack/commit/0f179ab120d4d4a99b755dc5eebc84d49eac30e7))
- dynamic-require rollup plugin ([b00cfb9](https://github.com/unjs/nitropack/commit/b00cfb93a5170af04676de5257ee62b312c423f1))
- enable externals.trace by default ([303debd](https://github.com/unjs/nitropack/commit/303debdf24f5666882cb7f4481840476c0c91950))
- export `defineNuxtConfig` from `nuxt3` and `@nuxt/bridge` ([#669](https://github.com/unjs/nitropack/issues/669)) ([8a02ab8](https://github.com/unjs/nitropack/commit/8a02ab812b043aa15da20d80be44572714cb083e))
- expose `useNitroApp` to access nitroApp ([3d82df1](https://github.com/unjs/nitropack/commit/3d82df1a654b5099102ec2dc9e9bedd50a90800c))
- expose process.env.SIGMA_PRESET ([8bdcc43](https://github.com/unjs/nitropack/commit/8bdcc4356714b0908b603e59aad0615f0cb2058b))
- **external:** improved subpath detection for externals ([d13b842](https://github.com/unjs/nitropack/commit/d13b842e42b9c3304e333957d4bc4f7317f95205))
- **externals:** smartly pick latest version and warn only on two different major ([cb03c96](https://github.com/unjs/nitropack/commit/cb03c96ce6abbd76714e381c9252e667d7486e9f))
- **externals:** write bundledDependencies and detect duplicate versions ([a898c8d](https://github.com/unjs/nitropack/commit/a898c8dc20d6748de83b2edec87ec88f868ff3f3))
- generate `.nitro/types/tsconfig.json` ([9494520](https://github.com/unjs/nitropack/commit/9494520769f52a8c3fc652a42ad08236a0018d29))
- generate meaningful chunkNames ([9e22f68](https://github.com/unjs/nitropack/commit/9e22f68aa1c5ec621339d4f9544d259983a11698))
- generate public (dist/) ([5f92307](https://github.com/unjs/nitropack/commit/5f92307ab8206d079d185618e258d012dca8ffa9))
- generic devHandler support ([9175a34](https://github.com/unjs/nitropack/commit/9175a34df6d02ecbcb1c7e5079025a1050e97cc4))
- handle api routes with router ([38b6631](https://github.com/unjs/nitropack/commit/38b66317dddb1ecb9d2a815268c29fa7f3a78ffb))
- handle caching headers for cachfied handlers ([ace355b](https://github.com/unjs/nitropack/commit/ace355b9e25235e24c21557e1a44e38a80d2a769))
- improve base url options ([#2655](https://github.com/unjs/nitropack/issues/2655)) ([9d8cf91](https://github.com/unjs/nitropack/commit/9d8cf9199e478b4eb99bc1dda3aea32bc6753e8f))
- improve cache support for event handlers ([9b4b01a](https://github.com/unjs/nitropack/commit/9b4b01af91aa99028140d19e6889a8570e83d835))
- improve dev error handling ([298a36b](https://github.com/unjs/nitropack/commit/298a36b99bc6d3104d1022e5ce443a32aadc6470))
- improve mocking ([e76cb19](https://github.com/unjs/nitropack/commit/e76cb19dc21462a375857676009b5fad174a629c))
- improve mocks ([6f411b2](https://github.com/unjs/nitropack/commit/6f411b2aa46d9de7605c8fea1938b57c44e957ac))
- improve types ([#6](https://github.com/unjs/nitropack/issues/6)) ([b982ae2](https://github.com/unjs/nitropack/commit/b982ae22bb6419df1f01260f250fcd052876858d))
- improved env support ([0c22cbe](https://github.com/unjs/nitropack/commit/0c22cbed3ce1a20e6b4533c72cd46b4c1b0275b0))
- improved externals and experimental trace with vercel/nft ([bc649ba](https://github.com/unjs/nitropack/commit/bc649ba948d9a1cccf23edd1a5169efdfb67e178))
- improved sever timing ([95e4538](https://github.com/unjs/nitropack/commit/95e45389cba4ee1ac63b36deb55ccb43df59d6fb))
- initial version of nu cli ([#54](https://github.com/unjs/nitropack/issues/54)) ([47f4198](https://github.com/unjs/nitropack/commit/47f4198206eb90f0dab3797e773fbfff98963285))
- inject sw script to pages ([b215c38](https://github.com/unjs/nitropack/commit/b215c38dddd4f319ffb3936df96dae7ecbf3df75))
- integrate $fetch with ohmyfetch ([c0fc176](https://github.com/unjs/nitropack/commit/c0fc17635f68b0473b00879eda3211b8802789cb))
- link crawling support ([462398f](https://github.com/unjs/nitropack/commit/462398f57c9bcd4886d614e060085a7264b1e525))
- load and extend config/preset with c12 ([e18211a](https://github.com/unjs/nitropack/commit/e18211a7cac4895af148bfd70e0856ca80bdb6ca))
- make browser target working again ([7c35713](https://github.com/unjs/nitropack/commit/7c357136e2591361e0706f6d7cd9efdc03daf808))
- make cloudflare working ([2ed7b35](https://github.com/unjs/nitropack/commit/2ed7b35fd813e7c7cb602581337eac4b74a5e62d))
- migrate to h3 0.5x with events API ([#23](https://github.com/unjs/nitropack/issues/23)) ([c705dd4](https://github.com/unjs/nitropack/commit/c705dd4893b9a127eb6c46797fb8039c1037f2cf))
- mock debug ([#118](https://github.com/unjs/nitropack/issues/118)) ([54bb024](https://github.com/unjs/nitropack/commit/54bb024b57a24382bd9863ef177e649250f857d4)), closes [#97](https://github.com/unjs/nitropack/issues/97)
- mock mime packages and fix v1 compat ([c960a22](https://github.com/unjs/nitropack/commit/c960a22d64069cfb2394f46856b9b273f239c012))
- mock stream ([435ce77](https://github.com/unjs/nitropack/commit/435ce7776683ba4d97a2362fe8dde949ddf0f01e))
- module utils and improvements ([#38](https://github.com/unjs/nitropack/issues/38)) ([58605e2](https://github.com/unjs/nitropack/commit/58605e2faddb6447e3b1f7f67bd5f383c4c40d38))
- natively parse and import async webpack chunks ([14b9db4](https://github.com/unjs/nitropack/commit/14b9db424f53e657e3d36b208e5e6fc11076f5c9))
- new public asset handling ([305c498](https://github.com/unjs/nitropack/commit/305c49853d514ceb00342107a7affdbd9500f5f2))
- nitro app plugins ([613a559](https://github.com/unjs/nitropack/commit/613a559cfd7f8ab445b947f4e18b517b4d86cda9))
- nitro endpoint for viewing `_vfs` ([#362](https://github.com/unjs/nitropack/issues/362)) ([edd67c5](https://github.com/unjs/nitropack/commit/edd67c5dbbda2c07019148ff7d16f351def93438))
- **nitro, vite:** use native module ([#252](https://github.com/unjs/nitropack/issues/252)) ([ad7044a](https://github.com/unjs/nitropack/commit/ad7044a2c50b7606ed00004e10e2b42d29d836dd))
- **nitro:** #config ([d169f11](https://github.com/unjs/nitropack/commit/d169f116200a188d0eff3e1c7170b0cab6910421))
- **nitro:** allow extending nitro context ([4a3a253](https://github.com/unjs/nitropack/commit/4a3a2539bdbee9162ab28e8440b30b45a7ff965a))
- **nitro:** assets driver ([#511](https://github.com/unjs/nitropack/issues/511)) ([9a8d992](https://github.com/unjs/nitropack/commit/9a8d992dbb710f3103d5a5ce83f52c2272e1fd8e))
- **nitro:** automatically type middleware/api routes ([#708](https://github.com/unjs/nitropack/issues/708)) ([3163fa2](https://github.com/unjs/nitropack/commit/3163fa217ed16e672c12d4dde3304a683fddb7cb))
- **nitro:** handle request body in workers ([#537](https://github.com/unjs/nitropack/issues/537)) ([c3249cb](https://github.com/unjs/nitropack/commit/c3249cb6e2f7c870e4a0e78f48401c60e08a798c))
- **nitro:** improve dev worker stability ([#1303](https://github.com/unjs/nitropack/issues/1303)) ([f71714d](https://github.com/unjs/nitropack/commit/f71714d3dde83a496de404d83c651c5774ae25bb))
- **nitro:** raw loader ([#75](https://github.com/unjs/nitropack/issues/75)) ([5acb394](https://github.com/unjs/nitropack/commit/5acb394a75cbc28f2fe3c094af4452f22c493190))
- **nitro:** server assets ([#83](https://github.com/unjs/nitropack/issues/83)) ([f71574c](https://github.com/unjs/nitropack/commit/f71574cd46829836d59e334fea1cf1fe529e003c))
- **nitro:** specify packages to copy to `.output/server/node_modules` ([#2382](https://github.com/unjs/nitropack/issues/2382)) ([acb0033](https://github.com/unjs/nitropack/commit/acb00338c3798128c4d6ca533d2903fde914dbeb))
- **nitro:** ssl nitro support in production ([#2742](https://github.com/unjs/nitropack/issues/2742)) ([9c48d73](https://github.com/unjs/nitropack/commit/9c48d73e59c9e68d0f471b2902847938a3d1d954))
- **nitro:** storage support ([#76](https://github.com/unjs/nitropack/issues/76)) ([958563c](https://github.com/unjs/nitropack/commit/958563c0e9da1b86419776686471fd1a51759078))
- **nitro:** support adding `node_modules` as middleware ([#2826](https://github.com/unjs/nitropack/issues/2826)) ([75d2674](https://github.com/unjs/nitropack/commit/75d2674ca1f24e7fc5c5e94b4ba0969d4bf65e16))
- **nitro:** support esbuild options config ([#550](https://github.com/unjs/nitropack/issues/550)) ([bff7db3](https://github.com/unjs/nitropack/commit/bff7db3a61a52c009c037006a42537e20a5b5db2))
- **nitro:** support importing/inlining wasm binaries ([#693](https://github.com/unjs/nitropack/issues/693)) ([a0ddbd2](https://github.com/unjs/nitropack/commit/a0ddbd2e16b0a0028541e74c4e727190352b16be))
- **nitro:** support netlify zero-config deployments ([#175](https://github.com/unjs/nitropack/issues/175)) ([ced37c2](https://github.com/unjs/nitropack/commit/ced37c20839dab4df9c7b0ae9358a34fc90dd593))
- **nitro:** update dependencies for node-fetch 3.x support ([#1373](https://github.com/unjs/nitropack/issues/1373)) ([9d12b7e](https://github.com/unjs/nitropack/commit/9d12b7e7ddf28d5f6322b7ae5047117d10d411c0))
- **nuxi:** add `nuxi preview` command for local testing ([#2162](https://github.com/unjs/nitropack/issues/2162)) ([b60a23a](https://github.com/unjs/nitropack/commit/b60a23ae61f3050ad3b467dc09bd5b189458ca9b))
- **nuxi:** bundle analyzer ([#701](https://github.com/unjs/nitropack/issues/701)) ([5364d04](https://github.com/unjs/nitropack/commit/5364d0444ccc5353c8152623b6590d6bbc8efb1e))
- nuxt bridge ([#459](https://github.com/unjs/nitropack/issues/459)) ([3de9574](https://github.com/unjs/nitropack/commit/3de9574cf827c11d3a4d3e6805b3eba388d76cf8))
- **nuxt3, bridge:** useRuntimeConfig ([#625](https://github.com/unjs/nitropack/issues/625)) ([832a9a4](https://github.com/unjs/nitropack/commit/832a9a44a246f5f9e50f57270561ae5d53fbcd1f))
- **nuxt3:** `useFetch` ([#721](https://github.com/unjs/nitropack/issues/721)) ([9b76832](https://github.com/unjs/nitropack/commit/9b768326aae4eaa7fb329f13071a110c50720d1e))
- optional pages and refactor nuxt3 ([#142](https://github.com/unjs/nitropack/issues/142)) ([39a0c4a](https://github.com/unjs/nitropack/commit/39a0c4a48617350bc03290b3b5dcd86afcae1338))
- prerender support ([24fb151](https://github.com/unjs/nitropack/commit/24fb1516bd14c19cb4e17e60de55f48dcd633efc))
- reexport common utils from `#nitro` index ([3dc2ee6](https://github.com/unjs/nitropack/commit/3dc2ee6d92bec9f4ece00f457887303053379298))
- resolve aliases with reference to themselves ([#26](https://github.com/unjs/nitropack/issues/26)) ([adb6c5d](https://github.com/unjs/nitropack/commit/adb6c5d1c7820feef63ed0851d7850f04d98ebb1))
- resolve externals with full path ([1c9b627](https://github.com/unjs/nitropack/commit/1c9b627f450eba8015f61e6224020e18a168812d))
- rewrite as nuxt module ([6881079](https://github.com/unjs/nitropack/commit/68810798975e49c041352741c08bdde09f9be6aa))
- **rollup:** allow custom replace entries ([18ee71b](https://github.com/unjs/nitropack/commit/18ee71b982d9ac8c15bdc2c374b860268fd2893c))
- serve-placeholder ([7a59183](https://github.com/unjs/nitropack/commit/7a591834193b85ef96d5dfa3a4bf3d8259883247))
- serveStatic ([#47](https://github.com/unjs/nitropack/issues/47)) ([af42712](https://github.com/unjs/nitropack/commit/af427122cd0733f5a2c115bdaef3557bb2478cd2))
- show fs tree for output ([a230bc7](https://github.com/unjs/nitropack/commit/a230bc7bbd25b7335b7104e70461e9bf61db95ae))
- sigma.client ([1656155](https://github.com/unjs/nitropack/commit/16561554610d56ad2a2fa25e3e9d6bb407a9b527))
- sourcemap support ([e47b266](https://github.com/unjs/nitropack/commit/e47b266c69c576b54795108e986faece6ed3e8b6))
- ssr with service worker ([971315c](https://github.com/unjs/nitropack/commit/971315c797c9c210b3966e3539da3d3c77415049))
- support `NITRO_APP_BASE_URL` for buid-time ([42ff5a3](https://github.com/unjs/nitropack/commit/42ff5a383a6d27eb6d66585171eac4cd7c6c4a0f))
- support `ssr: false` ([#351](https://github.com/unjs/nitropack/issues/351)) ([ddc045e](https://github.com/unjs/nitropack/commit/ddc045e0a6586c689a87c9a7d5aa4061600b098d))
- support dynamic chunks, lazy middleware and cjs target ([0caa11e](https://github.com/unjs/nitropack/commit/0caa11ee2113bcddf662224ba4aaf26362a3e51d))
- support overriding nested runtime config ([#2](https://github.com/unjs/nitropack/issues/2)) ([b9cdcbd](https://github.com/unjs/nitropack/commit/b9cdcbd1357c7dd3c554320a561b79a16597ba7e))
- support runtimeConfig (closes [#43](https://github.com/unjs/nitropack/issues/43)) ([5677d86](https://github.com/unjs/nitropack/commit/5677d86d8ee06290511abbc6f6600d6d2a5cfb98))
- support server directory ([#132](https://github.com/unjs/nitropack/issues/132)) ([cda0aa4](https://github.com/unjs/nitropack/commit/cda0aa47891aec8becec2620ae2faec7a803a723))
- support serverMiddleware ([e5cd009](https://github.com/unjs/nitropack/commit/e5cd009e537b00cb16a032d72abfe21db1605bdd))
- support serverMiddleware ([#26](https://github.com/unjs/nitropack/issues/26)) ([c99316f](https://github.com/unjs/nitropack/commit/c99316f8c98045f1cd2cacda4622d4d122aaf7a0))
- support serverMiddleware ([#26](https://github.com/unjs/nitropack/issues/26)) ([92e5015](https://github.com/unjs/nitropack/commit/92e5015aff81ad1e785985fdb0058f718bbb2555))
- support ssrContext.head ([8bcf6fb](https://github.com/unjs/nitropack/commit/8bcf6fb74b935c673a5f88a1c35b6327cb48a78b))
- support staticAssetsBase ([aca8be7](https://github.com/unjs/nitropack/commit/aca8be7d1eb3eb0866dc29dd681d5b807fe1382c))
- support targer functions to consume nuxtOptions ([725caec](https://github.com/unjs/nitropack/commit/725caecb1518b4195dd2024757c7272d2e8c5c03))
- support typescript via esbuild (closes [#42](https://github.com/unjs/nitropack/issues/42)) ([3dd5276](https://github.com/unjs/nitropack/commit/3dd5276d008506c2843b951a3120b4f47012f81c))
- support universalFetch during generate ([f656d3f](https://github.com/unjs/nitropack/commit/f656d3f72760b8d31fa21f9f8f4b6ea353ab55c2))
- swr support with route rules ([4e37f23](https://github.com/unjs/nitropack/commit/4e37f2319932bc2c4067d01f4bf95cba11a9c9fd))
- swtich to h2 stack for dev server ([4dfca5a](https://github.com/unjs/nitropack/commit/4dfca5ac874e8d74761c270286a3f0e83fd165be))
- timing plugin and Server-Timing ([424ce0a](https://github.com/unjs/nitropack/commit/424ce0af0edb88970650ab31984fc49fd2d1ad50))
- unimport support for server api ([#15](https://github.com/unjs/nitropack/issues/15)) ([9fc9e03](https://github.com/unjs/nitropack/commit/9fc9e032caca71843bbfb8eabf612fbc1d2068e9))
- update preset options ([12e1291](https://github.com/unjs/nitropack/commit/12e1291df6e3f9741449f7ae0aa888e437d0e186))
- update vercel and improve internals ([9b5ac28](https://github.com/unjs/nitropack/commit/9b5ac280f3ab5923e90fad7df3684488cf4a506f))
- use `@nuxt/design` ([#322](https://github.com/unjs/nitropack/issues/322)) ([b9a7033](https://github.com/unjs/nitropack/commit/b9a7033e4968fe9526bb93f50926aed265148a2e))
- use dynamic require for node targets ([a67944f](https://github.com/unjs/nitropack/commit/a67944fd83a139384f98829363d1f3055d3e1e3e))
- use h2@10 ([8ce644a](https://github.com/unjs/nitropack/commit/8ce644acc36ef02e855c5cb1bf361c75693e0e64))
- use native esm for all packages ([#539](https://github.com/unjs/nitropack/issues/539)) ([cf4d593](https://github.com/unjs/nitropack/commit/cf4d59378355e0633cd942ed9737fe52ecd7a0cf))
- use virtual filesystem for templates ([#292](https://github.com/unjs/nitropack/issues/292)) ([b0a9bd2](https://github.com/unjs/nitropack/commit/b0a9bd27516e5d5f37aead42b5ccd218064b479d))
- use webpack esm server build ([#474](https://github.com/unjs/nitropack/issues/474)) ([009579a](https://github.com/unjs/nitropack/commit/009579a8bb60de0767e2a9d65977f52c527a9909))
- **vite:** vite dev server bundler ([#604](https://github.com/unjs/nitropack/issues/604)) ([fb91ed2](https://github.com/unjs/nitropack/commit/fb91ed2d1847d9759036f0c99c13a67a0c16c814))
- whitelist static routes ([377a965](https://github.com/unjs/nitropack/commit/377a9659fc230a9153801e5da7b07ec887e9726c))
- **worker:** support process.hrtime ([a5904f5](https://github.com/unjs/nitropack/commit/a5904f5276c653be49c65da2b42ee881db6c0cf3))
- working cloudflare with vue2 and async chunks ([0255442](https://github.com/unjs/nitropack/commit/02554424c4623aaa08427346954f7a2b7b026bb0))
- working poc ([6f5c475](https://github.com/unjs/nitropack/commit/6f5c4752c7cc8e67736914bb15e2d7eca18dc3e5))

### Bug Fixes

- \_interopDefault potential cjs files ([d873169](https://github.com/unjs/nitropack/commit/d873169363201fcff68a42346b40655ecd51aa05))
- 404 handling for static assets ([c0cb35d](https://github.com/unjs/nitropack/commit/c0cb35df099c57ccf25d92eb28d9e65fb91f0425))
- add `node_modules` from cwd to nodeResolve ([035a6e6](https://github.com/unjs/nitropack/commit/035a6e6ebb3c75b44cc6fc14bb03fa02bf3da38d))
- add critical css ([37f6d79](https://github.com/unjs/nitropack/commit/37f6d797ec83370db0540d19ded954194775f24e))
- add default route when generating code ([df694ea](https://github.com/unjs/nitropack/commit/df694ea391cea425aaba13fe9103bf08a86ea4fb))
- add default value for assets.dirs ([4d7c6ac](https://github.com/unjs/nitropack/commit/4d7c6ac1f61ecc91908644d64984bbec7a3c417f))
- add default value for buildDir and generateDir ([565a27c](https://github.com/unjs/nitropack/commit/565a27cc1200df4c72c499174915383b1ff554f8))
- add generate.routes and disable crawler ([ec89296](https://github.com/unjs/nitropack/commit/ec8929643b57b4416ba688275ea0ac3253041775))
- add hack for encoding ([20b8f22](https://github.com/unjs/nitropack/commit/20b8f228c468cfae1ef8ddb0a62cd715f9bca156))
- add main entrypoints for packages ([#629](https://github.com/unjs/nitropack/issues/629)) ([e4e69f7](https://github.com/unjs/nitropack/commit/e4e69f75da77094a2e9afbb64e5c4a76f544b0f6))
- add missing `#_config` ([#24](https://github.com/unjs/nitropack/issues/24)) ([e06573c](https://github.com/unjs/nitropack/commit/e06573cbe0671e3e02de8d00cccdb5690e6d9771))
- add missing default for `devHandlers` ([43b2f41](https://github.com/unjs/nitropack/commit/43b2f415780be257c93503c1a3fbc88e709acbd0))
- add more types ([#16](https://github.com/unjs/nitropack/issues/16)) ([da7bbb2](https://github.com/unjs/nitropack/commit/da7bbb2c2a228d201cf9452b02a47d4d373372fd))
- add nitro client plugin ($fetch support) ([#223](https://github.com/unjs/nitropack/issues/223)) ([93213f4](https://github.com/unjs/nitropack/commit/93213f4f46bd5f6dcc05c2ff1a80321bc89c7779)), closes [#213](https://github.com/unjs/nitropack/issues/213)
- add prefix to dynamic imports name ([#5](https://github.com/unjs/nitropack/issues/5)) ([eecd766](https://github.com/unjs/nitropack/commit/eecd7660a1842bd0be87d6d640d4c15c8c1cc229))
- add temp fix for browser ([d197716](https://github.com/unjs/nitropack/commit/d19771663b8312379b99b1d9b7fee245292f3134))
- addresses static assets/azure issues ([#49](https://github.com/unjs/nitropack/issues/49)) ([88e8bd9](https://github.com/unjs/nitropack/commit/88e8bd92205592d9c3335f036ee8091aa4aef9c2))
- allow matching dynamic page routes ([88d0676](https://github.com/unjs/nitropack/commit/88d0676358cdbfab33f4fc467b8ea0ab464c5b26))
- allow not overriding env, and allow disabling prefix ([#40](https://github.com/unjs/nitropack/issues/40)) ([1d6a802](https://github.com/unjs/nitropack/commit/1d6a80246ff9b26c59f98a0740485f1f7a38e47c))
- allow numbers in dynamic webpack chunk names ([#125](https://github.com/unjs/nitropack/issues/125)) ([3bfa916](https://github.com/unjs/nitropack/commit/3bfa916f9500dd3b166f7d687a4ff1b8ad556911))
- allow use of nuxt3 in non-wsl windows environment ([#308](https://github.com/unjs/nitropack/issues/308)) ([da6da9c](https://github.com/unjs/nitropack/commit/da6da9c2b0bd6b2a096f0e151297c7ac04121c0d))
- always mock generic dependencies ([f210304](https://github.com/unjs/nitropack/commit/f2103046d492d3ce9957bb9a362b847cd84e1586))
- **app, nitro:** fix `app:rendered` hook ([#53](https://github.com/unjs/nitropack/issues/53)) ([ecc85f0](https://github.com/unjs/nitropack/commit/ecc85f048368cf2f822bcc5c461c3e475d11170c))
- **app:** make `renderMeta` optional ([#340](https://github.com/unjs/nitropack/issues/340)) ([844cbea](https://github.com/unjs/nitropack/commit/844cbeaec2e093e8cea77dd691cc82d627ed831d))
- **automock:** don't externalize .ts imports ([077bf13](https://github.com/unjs/nitropack/commit/077bf13b64c2b48f1d95a0998cf08c24a49ecdb9))
- avoid `replaceAll` for platform compatibility ([3cde549](https://github.com/unjs/nitropack/commit/3cde54924170193ff527c17eac43c1a20c4bfc27))
- avoid closing on dev command ([b6cca1a](https://github.com/unjs/nitropack/commit/b6cca1aab5c1743d9c3b6eed0767f5c609e0516a))
- avoid overriding hooks ([d722e9f](https://github.com/unjs/nitropack/commit/d722e9f7892313345c000205757c62b6996261ab))
- avoid reloading worker when entry not exists ([5d3ca2f](https://github.com/unjs/nitropack/commit/5d3ca2fcb5811a8c057cde47c5106a9b06fdef69))
- await for reload process before responding ([f441b30](https://github.com/unjs/nitropack/commit/f441b30095d5a1ab8f5e7df5ecf550d593ed09fa))
- **bridge:** plugin default detection ([#1847](https://github.com/unjs/nitropack/issues/1847)) ([f7748e2](https://github.com/unjs/nitropack/commit/f7748e22e4163211f416d47a000d087d3bf4f2f1))
- **bridge:** set `app.basePath` ([#2808](https://github.com/unjs/nitropack/issues/2808)) ([8df7624](https://github.com/unjs/nitropack/commit/8df762429e24485548a38b915bd5ba9fbaba0b54))
- bring back nuxt3 support ([a87c2a5](https://github.com/unjs/nitropack/commit/a87c2a58913b7d8405d7a471dd1f6cacacebb0f1))
- **browser:** 400.html ~> 404.html ([7c68add](https://github.com/unjs/nitropack/commit/7c68add9e686b0fe234a439d8863db908902e34b))
- check for server webpack config ([#91](https://github.com/unjs/nitropack/issues/91)) ([03bb235](https://github.com/unjs/nitropack/commit/03bb23569f30b338eb0cf0650999f66430cd39a3))
- clone config and preserve overrides for prerender instance ([08c65b8](https://github.com/unjs/nitropack/commit/08c65b8945b3d44ea99b72ca566d8906efa00ce3))
- cloudflare and polyfill ([dc967bc](https://github.com/unjs/nitropack/commit/dc967bcb77a733491475ffaac4dcc1327e83ceab))
- **cloudflare, lambda:** preserve query parameters in url ([#155](https://github.com/unjs/nitropack/issues/155)) ([b59986d](https://github.com/unjs/nitropack/commit/b59986d1b89e035be3b9011041d54bb362aff040))
- **compat:** add template variables for compat module ([#162](https://github.com/unjs/nitropack/issues/162)) ([126920a](https://github.com/unjs/nitropack/commit/126920aa7c54b99453a1ef0e772ea30f10e33723))
- **compat:** cannot read property setLegacyMiddleware of undefined ([#82](https://github.com/unjs/nitropack/issues/82)) ([29b368e](https://github.com/unjs/nitropack/commit/29b368effaa6562242d007371ca4e3a2448e7138))
- **compat:** disable webpack sourcemap ([#84](https://github.com/unjs/nitropack/issues/84)) ([961f18d](https://github.com/unjs/nitropack/commit/961f18de53f8c85933e9463a4638e5ad62be036d))
- **compat:** enforce nuxt generate for static target ([#148](https://github.com/unjs/nitropack/issues/148)) ([8e0b095](https://github.com/unjs/nitropack/commit/8e0b095bb0368c77df130942189f0cca424bcbfa))
- **components:** augment 'vue' module rather than overwriting ([#305](https://github.com/unjs/nitropack/issues/305)) ([c631f11](https://github.com/unjs/nitropack/commit/c631f115dd70d9d7da31daadf85e3bc04daeae72))
- **config:** always disasble server sourceMap ([#88](https://github.com/unjs/nitropack/issues/88)) ([a5eb76e](https://github.com/unjs/nitropack/commit/a5eb76e311d5a74239b7e57333759d367e562745))
- configurable publicPath (closes [#21](https://github.com/unjs/nitropack/issues/21)) ([9262d64](https://github.com/unjs/nitropack/commit/9262d64c5598c6fdf6e87730f622435047ff98dd))
- default value for template path ([b334942](https://github.com/unjs/nitropack/commit/b3349428bf5d2891e24e87542b68568185c9e80a))
- **dep:** pin esbuild to 0.10.x due to module breaking changes ([879a5bc](https://github.com/unjs/nitropack/commit/879a5bc02d680b61ab40d697c84d466cc39e03c3))
- **deps:** update `h3` to `0.5.2` ([ce14f33](https://github.com/unjs/nitropack/commit/ce14f334ebe5260437acf059ce7fae6d8bdb063a))
- **deps:** update dependency ohmyfetch to ^0.4.4 ([#1705](https://github.com/unjs/nitropack/issues/1705)) ([27f238f](https://github.com/unjs/nitropack/commit/27f238fe63ff8e0a9c2b73f0ead6afcbb10bd311))
- **deps:** upgrade jiti to 2.12.9 ([#1171](https://github.com/unjs/nitropack/issues/1171)) ([e939b36](https://github.com/unjs/nitropack/commit/e939b36e31afb334e4b4d216148cead201421559))
- **dev:** add conditional check for `removeAllListeners` call ([6529f60](https://github.com/unjs/nitropack/commit/6529f604d4783b1922ec339c0091026ef60364b7))
- **dev:** handle unhandledRejection and uncaughtException to avoid failing worker state ([4e8a661](https://github.com/unjs/nitropack/commit/4e8a6610742bc2b27e5feb4bdfa1d121776e3de0))
- **dev:** use localhost for emited host in port mode ([eb6ebdb](https://github.com/unjs/nitropack/commit/eb6ebdb4c475c8bffd4bf4608d93ee91be9d9378))
- disable cleanTargetDir for vercel ([9d8a95b](https://github.com/unjs/nitropack/commit/9d8a95b05424018bb1a76eedf9db2c732af7b751))
- disable external tracing for local preset ([0d7d102](https://github.com/unjs/nitropack/commit/0d7d102089dd4fb7e89313e4461d6d4c29bb0569))
- disable static manifest generation (resolves [#53](https://github.com/unjs/nitropack/issues/53)) ([df69cfa](https://github.com/unjs/nitropack/commit/df69cfa4808da3b8f867c97bc7a74a851c0eaae3))
- do not inline whole `rootDir` ([0929bcd](https://github.com/unjs/nitropack/commit/0929bcd651e6ab139554e0af946985765f826c56))
- don't set \_registeredComponents ([89b1958](https://github.com/unjs/nitropack/commit/89b1958f41f4fd5b9ec718f1f70074dc12abaf40))
- enable vue-resolution workaround ([17c3c60](https://github.com/unjs/nitropack/commit/17c3c60732df8b0ef70a6884fbdd53cc781e206e))
- ensure builds are relative to buildDir ([ba687f8](https://github.com/unjs/nitropack/commit/ba687f8c96c65cb51c1d7ecf4b561412d06969a0))
- exec require before return ([a3fb537](https://github.com/unjs/nitropack/commit/a3fb5372b21450833cc267bc551f2a589a2b52f8))
- expose types ([66b4973](https://github.com/unjs/nitropack/commit/66b4973f83b95b82a19f350c5eeb9a9e148fbce5))
- extend routes from serverless.static ([75ae176](https://github.com/unjs/nitropack/commit/75ae17631eed148349ecea9aebe314f2ccc5c1cd))
- **externals:** handle non pkg paths ([0831bac](https://github.com/unjs/nitropack/commit/0831bac1b511aaa9d8b4bf342996e76c7cdc8a78))
- **externals:** use normalizeid for external files ([b9db0e9](https://github.com/unjs/nitropack/commit/b9db0e932a7e6d8d2af35921d2b4355e2b0768c2))
- **externals:** windows compatibility with parseNodeModulePath ([935f39a](https://github.com/unjs/nitropack/commit/935f39a623406c826734e2771738113a8597136a))
- fix \_interopDefault implementation ([faa7245](https://github.com/unjs/nitropack/commit/faa72459271f46831e087f2b5b36601c404a57ae))
- fix error template formatting ([545ccf6](https://github.com/unjs/nitropack/commit/545ccf6c7e79e0832641f04b73b04e3a66c80bef))
- fix issues with router.base support ([5a7e0fa](https://github.com/unjs/nitropack/commit/5a7e0faf3d5ef9db11ca907df404babc0c1fdf30))
- fix mocks and disable buffer since is unnecessary ([ecdf2cd](https://github.com/unjs/nitropack/commit/ecdf2cd613771945acac6bf555171d2d58fff87a))
- fix preview and deploy command info ([1c1bf04](https://github.com/unjs/nitropack/commit/1c1bf0450a9d3ef49e5b5cc677b8bbee93d43b62))
- fix worker polyfill by adding performance ([a30fed4](https://github.com/unjs/nitropack/commit/a30fed4e46d4649e48ef9574e95258e4413a08c9))
- force rebuild on new files being added ([#136](https://github.com/unjs/nitropack/issues/136)) ([2ca8a87](https://github.com/unjs/nitropack/commit/2ca8a873504947d16f0f6226cbdb8ca411fcc439))
- handle decoding static file names ([#13](https://github.com/unjs/nitropack/issues/13)) ([5504ce9](https://github.com/unjs/nitropack/commit/5504ce9f3df5f54e9a70d66b2ff917b6cd26f686))
- handle if serverless is not set in config ([f055ddd](https://github.com/unjs/nitropack/commit/f055ddd12d780756d0ab87af0edd81e7c1f245b1))
- handle undefined error stack in production ([39ef2b3](https://github.com/unjs/nitropack/commit/39ef2b3854a749fecc62403e5b195d703342d231))
- hide rollup circular and eval ([e5f9900](https://github.com/unjs/nitropack/commit/e5f9900bc73456ddcb8a4c25649ed2d4f797c099))
- host ~> hostname ([7c663c2](https://github.com/unjs/nitropack/commit/7c663c20a67c8b30c434be36eefda2b3da4d61b7))
- ignore close listeners ([ae22387](https://github.com/unjs/nitropack/commit/ae22387c3fe6235428ad8e7000b6c92dfba2fd07))
- ignore resolving vue alias when not found ([5f12eaa](https://github.com/unjs/nitropack/commit/5f12eaa706a84ec1caf28a988b12ffbea40767a5))
- improve externals handling ([a5262e4](https://github.com/unjs/nitropack/commit/a5262e4fa998d4fe4a733ac656c23fe198b72589))
- improve prerender logs ([32ff5e4](https://github.com/unjs/nitropack/commit/32ff5e49b11058ffc9b91c3c55b4787ffa6693f7))
- improve type declarations ([#1178](https://github.com/unjs/nitropack/issues/1178)) ([a2526f7](https://github.com/unjs/nitropack/commit/a2526f7c10f73336c889598eac676060eab58d87))
- issues with externals outside of rootDir ([a7cbfbe](https://github.com/unjs/nitropack/commit/a7cbfbe1d6fe94dfc20e36370dd074a248555d9d))
- lazy is true by default ([04d28b9](https://github.com/unjs/nitropack/commit/04d28b9f609d5456546a2ecc112df6ec532f2354))
- less verbose logs when testing ([00177d0](https://github.com/unjs/nitropack/commit/00177d02b7181e990983a3527f2d2d4106bf83bb))
- load webpack modules synchronously with `require` ([#104](https://github.com/unjs/nitropack/issues/104)) ([c20e813](https://github.com/unjs/nitropack/commit/c20e81387baf2eee54718ce94ab2b4865a2d82b4))
- move hrtime polyfill to timing plugin ([fe9d073](https://github.com/unjs/nitropack/commit/fe9d0737b88a8219f4fa278d87df6ae800663869))
- **netlify:** update output templates ([4f46310](https://github.com/unjs/nitropack/commit/4f46310633d5a78b0ef618aa7e500134c20a1344))
- **nitro, nuxi:** add runtimeConfig types (for `#config` and `useRuntimeConfig()`) ([#1783](https://github.com/unjs/nitropack/issues/1783)) ([486be51](https://github.com/unjs/nitropack/commit/486be51e10871a81b83d4f80374055220abf715f))
- **nitro:** `dot-prop` esm compatibility ([#829](https://github.com/unjs/nitropack/issues/829)) ([f157f56](https://github.com/unjs/nitropack/commit/f157f5680fbac314f470c9b83629d09ce7630f0a))
- **nitro:** `table` esm compatibility (resolves [#877](https://github.com/unjs/nitropack/issues/877)) ([4c05a90](https://github.com/unjs/nitropack/commit/4c05a905b18c7a929996e432796015bd188e6457))
- **nitro:** absolute external resolution ([#80](https://github.com/unjs/nitropack/issues/80)) ([b03c813](https://github.com/unjs/nitropack/commit/b03c813e45a1bfc7684f1ab727a3aeeca3780c1c))
- **nitro:** add back compat entry ([70bf183](https://github.com/unjs/nitropack/commit/70bf1834e14ebe0825d7846a23cf6e6304af6345))
- **nitro:** add body + body prepended scripts to template ([#154](https://github.com/unjs/nitropack/issues/154)) ([f348588](https://github.com/unjs/nitropack/commit/f348588f7b76885431ab154be3d93fa563537787))
- **nitro:** add error logging to `initWorker`([#2090](https://github.com/unjs/nitropack/issues/2090)) ([9e004e1](https://github.com/unjs/nitropack/commit/9e004e10195d4e9a5f31ef0d35f949a044ae2693))
- **nitro:** add missing kit dependency ([dfa3d8d](https://github.com/unjs/nitropack/commit/dfa3d8da8a6710da31c619a6e77bad2c8fc02bfe))
- **nitro:** add temporary workarouind for ufo resolution in nuxt2 ([e5ecf6b](https://github.com/unjs/nitropack/commit/e5ecf6b029e657f7f097f1a8e4b19a9cb8821cc8))
- **nitro:** allow inlining subpath of externals ([#2759](https://github.com/unjs/nitropack/issues/2759)) ([30023f7](https://github.com/unjs/nitropack/commit/30023f79f745bedbe47200b07e4e913bd1ea76da))
- **nitro:** always inline `.wasm` ([#698](https://github.com/unjs/nitropack/issues/698)) ([e7bb03c](https://github.com/unjs/nitropack/commit/e7bb03ce731d1411368472915539889be68e5f87))
- **nitro:** avoid using fs/promises ([bd25e87](https://github.com/unjs/nitropack/commit/bd25e873b9ebf1869538265b923f7ae5a9741a2b))
- **nitro:** bundle json files ([#1245](https://github.com/unjs/nitropack/issues/1245)) ([adf2235](https://github.com/unjs/nitropack/commit/adf223590f00899d06e9b40ddaf83d037c5bfe58))
- **nitro:** correct `#assets` type declaration ([#2403](https://github.com/unjs/nitropack/issues/2403)) ([bc9817c](https://github.com/unjs/nitropack/commit/bc9817ce02c565c62885f4c9f7328f3c1bb00b11))
- **nitro:** correct issues rendering `payload.js` ([#466](https://github.com/unjs/nitropack/issues/466)) ([584a14d](https://github.com/unjs/nitropack/commit/584a14db5156a8e99261037d2c6f069fa082f69c))
- **nitro:** correct vercel fs api static directory ([#488](https://github.com/unjs/nitropack/issues/488)) ([cd0616e](https://github.com/unjs/nitropack/commit/cd0616e111cce78057f5fda7b13f793754c086db))
- **nitro:** detect `NETLIFY_LOCAL` ([#400](https://github.com/unjs/nitropack/issues/400)) ([f78d185](https://github.com/unjs/nitropack/commit/f78d1858d2e7b82467c8982716f2864f450f2ddd))
- **nitro:** detect routes and middleware starting with dots ([#2771](https://github.com/unjs/nitropack/issues/2771)) ([9b3d6c2](https://github.com/unjs/nitropack/commit/9b3d6c2dbd5300f0daa983fc6f749f6fe41f628f))
- **nitro:** disable `moduleSideEffects` by default ([#377](https://github.com/unjs/nitropack/issues/377)) ([ec207e9](https://github.com/unjs/nitropack/commit/ec207e9c9ff7e57733f9bb97df9dcfcf4511be79))
- **nitro:** disable automatic spa fallback ([#1071](https://github.com/unjs/nitropack/issues/1071)) ([4427b89](https://github.com/unjs/nitropack/commit/4427b89a69ddd469812b6324a2e45dd4bc13f904))
- **nitro:** disable externals in worker preset ([#535](https://github.com/unjs/nitropack/issues/535)) ([2298276](https://github.com/unjs/nitropack/commit/22982761af47b0e7693957d04c46a69fed5df275))
- **nitro:** do not modify `event.request` for worker entries ([#1279](https://github.com/unjs/nitropack/issues/1279)) ([cc9a4cd](https://github.com/unjs/nitropack/commit/cc9a4cd24f6acad4ae7e4183a34cd5da8e04ba06))
- **nitro:** do not overwrite output files for browser-preset ([#516](https://github.com/unjs/nitropack/issues/516)) ([69fd546](https://github.com/unjs/nitropack/commit/69fd546b63f10becd706d24b917e01e1b60aaa00))
- **nitro:** don't externalize [@nuxt](https://github.com/nuxt), virtual: and # ([e53e297](https://github.com/unjs/nitropack/commit/e53e297cee7dc4e3fc62c6fb1f88a28d81505e36))
- **nitro:** emit chunk names without `#` ([#477](https://github.com/unjs/nitropack/issues/477)) ([ce9a38e](https://github.com/unjs/nitropack/commit/ce9a38e23903802b7c29bec9215c899a3e44b379))
- **nitro:** ensure that nitro runtime is not externalized ([#121](https://github.com/unjs/nitropack/issues/121)) ([d78237d](https://github.com/unjs/nitropack/commit/d78237db1bd7b662a687884eb1cc8c0c934cfb6a))
- **nitro:** exclude `rootDir` from externals and reinstate automock warning ([#66](https://github.com/unjs/nitropack/issues/66)) ([5d9344f](https://github.com/unjs/nitropack/commit/5d9344fc529995d5de0a4b9f24d2f12f2cab6c79))
- **nitro:** export named function rather than default export ([#490](https://github.com/unjs/nitropack/issues/490)) ([3ade210](https://github.com/unjs/nitropack/commit/3ade21091684a1306800f19871854b7e78932f77))
- **nitro:** filter alias in `/_vfs` listing ([#1296](https://github.com/unjs/nitropack/issues/1296)) ([39b6db8](https://github.com/unjs/nitropack/commit/39b6db8ee1692ac2a163a144d0c9c523974c42d4))
- **nitro:** filter out duplicate imports ([#378](https://github.com/unjs/nitropack/issues/378)) ([6ce6f68](https://github.com/unjs/nitropack/commit/6ce6f6875f70e37143e36100501cb71b70fceb1a))
- **nitro:** firebase package.json is not exported ([#809](https://github.com/unjs/nitropack/issues/809)) ([31454ea](https://github.com/unjs/nitropack/commit/31454eaac26bf081b206ee23756ff9d070a0d194))
- **nitro:** fix EBUSY error on windows ([#425](https://github.com/unjs/nitropack/issues/425)) ([5d79b2f](https://github.com/unjs/nitropack/commit/5d79b2f4a7af22a9be48f92357a4406bf9ed5006))
- **nitro:** fix externals regex for scoped packages ([349c1d0](https://github.com/unjs/nitropack/commit/349c1d09b057781fccf5d4c67475c1632248500c)), closes [#238](https://github.com/unjs/nitropack/issues/238)
- **nitro:** fix regex for tracedFiles scanning ([#1509](https://github.com/unjs/nitropack/issues/1509)) ([6054d5b](https://github.com/unjs/nitropack/commit/6054d5b1c9663c72d2c7c73375691f0226773783))
- **nitro:** fix rendering with `ssr` disabled ([#2191](https://github.com/unjs/nitropack/issues/2191)) ([d32d40d](https://github.com/unjs/nitropack/commit/d32d40df11e699f0503ba8dfa3c9fcf04a8ded49))
- **nitro:** fix type inference for `$fetch` ([#938](https://github.com/unjs/nitropack/issues/938)) ([d9fdf29](https://github.com/unjs/nitropack/commit/d9fdf29ff913a2d2489b157cb1696c4638d6d4f9))
- **nitro:** generate correct netlify entrypoint ([#372](https://github.com/unjs/nitropack/issues/372)) ([49a5ebd](https://github.com/unjs/nitropack/commit/49a5ebd872c7477b91db3b9d2ae30841e90a790c))
- **nitro:** generate netlify `_redirects` in public ([#298](https://github.com/unjs/nitropack/issues/298)) ([2534dc6](https://github.com/unjs/nitropack/commit/2534dc6911253581446597a87710108a5672f39f))
- **nitro:** handle esm imports from cjs files ([8decd90](https://github.com/unjs/nitropack/commit/8decd9008cad16bba135d72f3fdd96d3244f4b03))
- **nitro:** handle ssr redirects ([#392](https://github.com/unjs/nitropack/issues/392)) ([42405c2](https://github.com/unjs/nitropack/commit/42405c252d9a50124566d0f15b5f7c40be463f3d))
- **nitro:** handle static assets and api routes for `service-worker` preset ([#518](https://github.com/unjs/nitropack/issues/518)) ([9808f05](https://github.com/unjs/nitropack/commit/9808f05b510c2613e189d3c82726fa0d8e303eac))
- **nitro:** handle terminating uninitialized worker ([9132a67](https://github.com/unjs/nitropack/commit/9132a67131bb8511b0ea8be3ac7a2dd2b134696f))
- **nitro:** import externals as esm namespace ([#394](https://github.com/unjs/nitropack/issues/394)) ([1b7f9af](https://github.com/unjs/nitropack/commit/1b7f9af123f6fdb0fe773984fd92181bf1de6971))
- **nitro:** import rollup as cjs ([1d9602c](https://github.com/unjs/nitropack/commit/1d9602cf00d6b444df0a79774ec5cef05d1f0e6a))
- **nitro:** improve externals error handling ([#1188](https://github.com/unjs/nitropack/issues/1188)) ([59ea572](https://github.com/unjs/nitropack/commit/59ea5722b5ff57a14fd737b7ef032a512848a496))
- **nitro:** inject entryURL at beginning of entrypoint ([#468](https://github.com/unjs/nitropack/issues/468)) ([cb3affa](https://github.com/unjs/nitropack/commit/cb3affa4eb96242c6a995632dba72da5f393c8c3))
- **nitro:** inject payload for spa renderer ([#1434](https://github.com/unjs/nitropack/issues/1434)) ([09061ca](https://github.com/unjs/nitropack/commit/09061ca194935c9effe147d9bf55394a4733dbc2))
- **nitro:** mock consola ([#106](https://github.com/unjs/nitropack/issues/106)) ([1679d18](https://github.com/unjs/nitropack/commit/1679d18133676e41941854762207cc9814defccb))
- **nitro:** modify contents rather than compiled , remove template `compiled` ([#1154](https://github.com/unjs/nitropack/issues/1154)) ([5d7740c](https://github.com/unjs/nitropack/commit/5d7740c229ae4e6e3be83971a44d738b165e2f6a))
- **nitro:** narrow replace call for template name ([#1626](https://github.com/unjs/nitropack/issues/1626)) ([4e0f597](https://github.com/unjs/nitropack/commit/4e0f597aa429b60b5d1a7cbf846637a0ef11907c))
- **nitro:** omit `/index` from generated api urls ([#1371](https://github.com/unjs/nitropack/issues/1371)) ([f1a17f2](https://github.com/unjs/nitropack/commit/f1a17f28366887761c0909f8c3380c304774d247))
- **nitro:** only serve placeholders for `publicPath` ([1cf0844](https://github.com/unjs/nitropack/commit/1cf0844b1d5770a17a84b20bd7fff6e8fe82770e))
- **nitro:** ovrride by user input ([306b96f](https://github.com/unjs/nitropack/commit/306b96f82e97d42f0fcf082147a523714d9b478d))
- **nitro:** pass `Headers` to `createFetch` ([#2615](https://github.com/unjs/nitropack/issues/2615)) ([87da9c7](https://github.com/unjs/nitropack/commit/87da9c7a8d80673e3ff4f879c9212db4dea7225f))
- **nitro:** pass query params to localCall in service worker ([#530](https://github.com/unjs/nitropack/issues/530)) ([2af7359](https://github.com/unjs/nitropack/commit/2af7359f0bf95c6f6405325a47c99d8914dfa580))
- **nitro:** pass req, res to ssr context (resolves [#39](https://github.com/unjs/nitropack/issues/39)) ([0e651d8](https://github.com/unjs/nitropack/commit/0e651d8e2c7b471a54b33e0d4f42930f2b263fcf))
- **nitro:** pass sourcemap option through to rollup plugins ([#2387](https://github.com/unjs/nitropack/issues/2387)) ([2122f5c](https://github.com/unjs/nitropack/commit/2122f5cc7a8ec901a832474db79d0d4848829ab1))
- **nitro:** promisify proxy handler ([#398](https://github.com/unjs/nitropack/issues/398)) ([0765495](https://github.com/unjs/nitropack/commit/0765495207d48c7d0dea8e5fd98136beef7390d0))
- **nitro:** read body stream on post requests for `service-worker` ([#527](https://github.com/unjs/nitropack/issues/527)) ([cf19a6a](https://github.com/unjs/nitropack/commit/cf19a6a6bcb0e496493c5cc2643fc559ba1d3319))
- **nitro:** read firebase package.json ([#1108](https://github.com/unjs/nitropack/issues/1108)) ([cc66a40](https://github.com/unjs/nitropack/commit/cc66a404debfd4dd3176783c438629b5df1bdb5e))
- **nitro:** remove depd unenv alias ([#120](https://github.com/unjs/nitropack/issues/120)) ([10083b6](https://github.com/unjs/nitropack/commit/10083b6e106dd4952a2780f43d1015063750974c))
- **nitro:** resolve alias for serverMiddleware ([79ef2fb](https://github.com/unjs/nitropack/commit/79ef2fb055e6f5f5d4810645b4b968e9cbe14d70))
- **nitro:** resolve default export for assets ([60c1b6b](https://github.com/unjs/nitropack/commit/60c1b6ba0a0c759eac917aac56e968639d054c05))
- **nitro:** resolve firebase package versions with `pkg-types` ([#1490](https://github.com/unjs/nitropack/issues/1490)) ([971a9dd](https://github.com/unjs/nitropack/commit/971a9ddc5584d85a0af346135279d1fe9ca5725e))
- **nitro:** respect fs structure for traced files ([#2107](https://github.com/unjs/nitropack/issues/2107)) ([e3faaed](https://github.com/unjs/nitropack/commit/e3faaed1e8584b337bd1da43f856aa2e90fc8999))
- **nitro:** revert to main rollup import (closes [#1445](https://github.com/unjs/nitropack/issues/1445)) ([5056059](https://github.com/unjs/nitropack/commit/505605922756026b95b04d7d4b7e787ee3a2b57d))
- **nitro:** set `makeAbsoluteExternalsRelative` to false (resolves [#160](https://github.com/unjs/nitropack/issues/160)) ([df28558](https://github.com/unjs/nitropack/commit/df285585a145733fc8a7a67e14691b91b993de95))
- **nitro:** set content-type header before html 404 ([#2301](https://github.com/unjs/nitropack/issues/2301)) ([68ab584](https://github.com/unjs/nitropack/commit/68ab584b7a089e425014fd692b7156e42622f11b))
- **nitro:** set esbuild `target: '2019'` ([#189](https://github.com/unjs/nitropack/issues/189)) ([7d8505c](https://github.com/unjs/nitropack/commit/7d8505c59dde1a4a8dbea40bd3d8bdfedaa7de36))
- **nitro:** show all ERR_MODULE_NOT_FOUND errors ([#561](https://github.com/unjs/nitropack/issues/561)) ([1a98e26](https://github.com/unjs/nitropack/commit/1a98e262f6732b3361615f7639cad370ecae76da))
- **nitro:** skip copying symlinks and directories ([#1510](https://github.com/unjs/nitropack/issues/1510)) ([5a0d1a1](https://github.com/unjs/nitropack/commit/5a0d1a1f0ff140313b94134b85a7a32da198ae9d))
- **nitro:** skip non existing externals ([#1876](https://github.com/unjs/nitropack/issues/1876)) ([bae42e9](https://github.com/unjs/nitropack/commit/bae42e9f691ca6560de5a3a588b3101fb99394eb))
- **nitro:** sort middleware fron long to short ([340bc61](https://github.com/unjs/nitropack/commit/340bc61fda9cec163e269901170b89b86a2d55b5))
- **nitro:** support ~/@ aliases and explicitly externalize buildDir ([242207a](https://github.com/unjs/nitropack/commit/242207ab7e32bd3bcad4566f816fc40f01349d02))
- **nitro:** support built `publicPath` ([#1479](https://github.com/unjs/nitropack/issues/1479)) ([8934c04](https://github.com/unjs/nitropack/commit/8934c0477299ea7c098c78b3babd8c05027f2b89))
- **nitro:** support vue-meta (compat) ([f0cd329](https://github.com/unjs/nitropack/commit/f0cd32997ecf5acbb95dbeefdc41e922ada080f7))
- **nitro:** terminate active worker before replacing ([#1302](https://github.com/unjs/nitropack/issues/1302)) ([1b93a42](https://github.com/unjs/nitropack/commit/1b93a42c81ec05497244aa9b6fa9b00a989612b0))
- **nitro:** type inference for api routes returning promise ([#1483](https://github.com/unjs/nitropack/issues/1483)) ([3f5bba1](https://github.com/unjs/nitropack/commit/3f5bba15f6d7430493b98f1fb3a0faaa18254a9e))
- **nitro:** update azure swa implementation ([#1069](https://github.com/unjs/nitropack/issues/1069)) ([5194af6](https://github.com/unjs/nitropack/commit/5194af646b53dbff93b360f60c9b3cbf0ff305e5))
- **nitro:** update dot-prop import ([81f51d5](https://github.com/unjs/nitropack/commit/81f51d5fc2df92504fbe0d4f0a8a85720efdae5c))
- **nitro:** update firebase preset to handle mjs output ([#1360](https://github.com/unjs/nitropack/issues/1360)) ([7797383](https://github.com/unjs/nitropack/commit/77973834388c87809f1075000373ad9c5571e775))
- **nitro:** update nitro internal hook name ([#218](https://github.com/unjs/nitropack/issues/218)) ([f99d5a2](https://github.com/unjs/nitropack/commit/f99d5a25b9b48365ff1928bc184394c267bc5f48))
- **nitro:** upgrade table dependency ([3e43fd7](https://github.com/unjs/nitropack/commit/3e43fd78e75bc5e103231606df18c44a649e6bb0)), closes [#2250](https://github.com/unjs/nitropack/issues/2250)
- **nitro:** use `app.assetsPath` for `publicPath` ([#1978](https://github.com/unjs/nitropack/issues/1978)) ([699e763](https://github.com/unjs/nitropack/commit/699e7638842fb8bf451bba06327ce8364eb130bd))
- **nitro:** use `generate:page` hook for browser to inject sw ([134431b](https://github.com/unjs/nitropack/commit/134431b3db9b9c7577a33a9c023275caae53c7ba)), closes [#522](https://github.com/unjs/nitropack/issues/522)
- **nitro:** use file url for `#build` alias in windows dev ([#469](https://github.com/unjs/nitropack/issues/469)) ([d4a9f23](https://github.com/unjs/nitropack/commit/d4a9f233a888808bed3a582261b90a2c0f45a985))
- **nitro:** use globalThis ([5a0d9e7](https://github.com/unjs/nitropack/commit/5a0d9e7303cfea8e3ffa6fd7abd05bde3f809b00))
- **nitro:** use nuxt2 compatible template ([#268](https://github.com/unjs/nitropack/issues/268)) ([48e2dfa](https://github.com/unjs/nitropack/commit/48e2dfa346f5fd790c4f31f6ec27d80d39a4067a)), closes [#265](https://github.com/unjs/nitropack/issues/265)
- **nitro:** use random port for stackblitz ([#1666](https://github.com/unjs/nitropack/issues/1666)) ([d5bb79c](https://github.com/unjs/nitropack/commit/d5bb79c48c7a23d8061fc4279eb02f4c6e47f718))
- **nitro:** use unenv 0.3.x (closes [#266](https://github.com/unjs/nitropack/issues/266)) ([6ac6aeb](https://github.com/unjs/nitropack/commit/6ac6aeb94a66427ddc958832793cb0c4d039a4f7))
- **nitro:** used named export for azure entry ([#491](https://github.com/unjs/nitropack/issues/491)) ([903ab87](https://github.com/unjs/nitropack/commit/903ab872bfc509d90d518c8aa1ba59ad19dc7f85))
- **nitro:** watch .mjs and .cjs extensions (closes [#352](https://github.com/unjs/nitropack/issues/352)) ([cab8faa](https://github.com/unjs/nitropack/commit/cab8faa866b14b5d1b8f8a65a6306ecf654750b8))
- **nitro:** workaround for vue2 global style injection ([f1b74d0](https://github.com/unjs/nitropack/commit/f1b74d093421e42322195cd5a6e58ba544c59794))
- **nuxi:** update version and vite detection ([#1169](https://github.com/unjs/nitropack/issues/1169)) ([db69571](https://github.com/unjs/nitropack/commit/db695717b49ac8c3d481ad9e22b7bd01cd440760))
- **nuxt3:** provide `NuxtWelcome` component from design ([#745](https://github.com/unjs/nitropack/issues/745)) ([2d13716](https://github.com/unjs/nitropack/commit/2d137168b6a621ea403af116996dfd553b007882))
- only generate .sls directory when needed ([de51381](https://github.com/unjs/nitropack/commit/de513815b597c08009a7a22e064046e1a4195567))
- pass Headers to createFetch ([#7](https://github.com/unjs/nitropack/issues/7)) ([0b55f3c](https://github.com/unjs/nitropack/commit/0b55f3cdc22d3e8fa3996d1d6f5f15dddadb9e54))
- **pkg:** downgrade node version to 14.16.x due to stackblitz issue ([18d2a90](https://github.com/unjs/nitropack/commit/18d2a907aa9b21135767841e39ac83e096058720))
- **pkg:** downgrade node version to 14.17.x due to codesandbox issue ([f00f9d4](https://github.com/unjs/nitropack/commit/f00f9d4d5d22c93529ca721b9093e35ea04bcc69))
- **pkg:** expose `defineNitroPreset` ([4846247](https://github.com/unjs/nitropack/commit/48462472ea27b00f66528946dcffbec60b0851bc))
- **pkg:** remove vue3 from peerDependencies ([#1382](https://github.com/unjs/nitropack/issues/1382)) ([814ac73](https://github.com/unjs/nitropack/commit/814ac7377a2321aa039bb714b4cf3ce0e8f0f253))
- **pkg:** support node 17.x in the engines field ([#1443](https://github.com/unjs/nitropack/issues/1443)) ([3416d8c](https://github.com/unjs/nitropack/commit/3416d8c7be8eb6f70e94fce319f2309a3dcbc90a))
- preset types ([5574f7e](https://github.com/unjs/nitropack/commit/5574f7e2216ef16c0ffa7f91821d2e7f5f6891f1))
- promisify: false support ([768081b](https://github.com/unjs/nitropack/commit/768081bca2443530fa890ad91724649d3452f07d))
- properly resolve runtimeDir from chunks ([9adfacd](https://github.com/unjs/nitropack/commit/9adfacd860cbecfd4eb0d101b9f5072a9f01e50c))
- remove extra `console.log` ([82c2767](https://github.com/unjs/nitropack/commit/82c27673951248c7e1527b8c7f683357c3a8d8f4))
- remove runtime/ prefix ([0be4ba1](https://github.com/unjs/nitropack/commit/0be4ba18acd1359775ae1c741812c336766759c1))
- remove windows workaround for now ([4af4f32](https://github.com/unjs/nitropack/commit/4af4f32e386ea5d55bb84306bfd7f5393dce48d2))
- rename cold start -> nitro start ([#12](https://github.com/unjs/nitropack/issues/12)) ([bba998b](https://github.com/unjs/nitropack/commit/bba998b4364a2d04527c7ccfc364143d7b09d115))
- **render:** don't override statusCode ([f166cfa](https://github.com/unjs/nitropack/commit/f166cfa612ec13eccd19a9f044781e77ef1ddc9f))
- resolve chunksDirName based on outNames dirname (vercel) ([e82cfcc](https://github.com/unjs/nitropack/commit/e82cfcc5004f542ebf29897ea245262994b53e29))
- resolve runtime provided dependencies ([3e9e27e](https://github.com/unjs/nitropack/commit/3e9e27efb67e4c13d27b4ff1fc5dcffa399959db))
- **resolveMiddleware:** remove legacy handler and path props ([1de3717](https://github.com/unjs/nitropack/commit/1de3717b2c778ea7ff2a5e1a3945b0584dc9165f))
- **rollup:** dirnames not generate a sourcemap for the transformation ([#83](https://github.com/unjs/nitropack/issues/83)) ([a8c02df](https://github.com/unjs/nitropack/commit/a8c02df9ced9e7f4a86742113728d5b8700d8d9b))
- sanitize rollup-generated filenames ([#1648](https://github.com/unjs/nitropack/issues/1648)) ([5c49e2a](https://github.com/unjs/nitropack/commit/5c49e2aac3a0e325ceb13a7ca21e74574a4cf662))
- **schema:** extend `NuxtOptions` for nitro & bridge types ([#2131](https://github.com/unjs/nitropack/issues/2131)) ([4d8e184](https://github.com/unjs/nitropack/commit/4d8e184d73cc3b8f31b66bc5be8fb5b3f7ea7b47))
- **schema:** handle null/undefined values in `runtimeConfig` ([#2456](https://github.com/unjs/nitropack/issues/2456)) ([7ad2764](https://github.com/unjs/nitropack/commit/7ad276479a917fac2e1eeaa08a42d7d727bd66c9))
- serve public assets in production ([2dfad65](https://github.com/unjs/nitropack/commit/2dfad65497ea211294a1bcadb10d80eb29ef64e0))
- **service-worker:** check for asset urls ([aab6fbf](https://github.com/unjs/nitropack/commit/aab6fbf753da00d06eee1c7d2bfaef881572fd4c))
- silent proxy errors ([63a083c](https://github.com/unjs/nitropack/commit/63a083c02bf9b45b5df0ccf838833a6c435790c8))
- skip static dir if not exists ([3b87c28](https://github.com/unjs/nitropack/commit/3b87c28d72be042ef9f247daaba678654610b4ff))
- small bug fixes ([26046ee](https://github.com/unjs/nitropack/commit/26046ee84ae787bee45a4d3ed4e40557fa074448))
- static asset handling with leading slash ([2303c7d](https://github.com/unjs/nitropack/commit/2303c7d6a2dfffa193be2b6e45cc09e488be8b36))
- static dir is in `srcDir` ([#37](https://github.com/unjs/nitropack/issues/37)) ([20fe1dc](https://github.com/unjs/nitropack/commit/20fe1dcee1cb42a0aac26b5191f5681bc6548814))
- **storage:** replace non-word characters with underscore ([#542](https://github.com/unjs/nitropack/issues/542)) ([01628ae](https://github.com/unjs/nitropack/commit/01628ae48bfaa75380b44c433f6ce5846a4df8c6))
- support both targets by adding prepare step ([36bfc43](https://github.com/unjs/nitropack/commit/36bfc43db294dfa4985aa89c6211d89184e78861))
- temporary disable auto mock plugin ([414dfb6](https://github.com/unjs/nitropack/commit/414dfb6acf6f4abb09d4ad22d57dd7776455ee15))
- temporary remove dev warning for pwa module ([#40](https://github.com/unjs/nitropack/issues/40)) ([e1cf8a0](https://github.com/unjs/nitropack/commit/e1cf8a06c3fe01036f2e70386932eb0651704936))
- timing plugin helper import ([d9b28da](https://github.com/unjs/nitropack/commit/d9b28da5291def39419b044cb956b804c9ba53b6)), closes [nuxt/framework#3399](https://github.com/nuxt/framework/issues/3399)
- **timing:** include helpers only in entries ([fe5a33e](https://github.com/unjs/nitropack/commit/fe5a33e1605464da63edf5d45d944cbe795aec71))
- update `service-worker` preset ([ce3aaf6](https://github.com/unjs/nitropack/commit/ce3aaf6d7caab4f8797a5e435372719ecbe82dc9))
- update changed mw.path => route ([359a959](https://github.com/unjs/nitropack/commit/359a959725719f65f3e9978052be9ea4b9cdaa93))
- update documentPath with updated buildDir ([#70](https://github.com/unjs/nitropack/issues/70)) ([25fa3eb](https://github.com/unjs/nitropack/commit/25fa3ebb3eb8b8a54b9a12cd621353949e749d54))
- update h3 for static asset handling ([2861c61](https://github.com/unjs/nitropack/commit/2861c61f333d07fd5028425c9366f228089b2e66))
- update node-resolve options ([e33b658](https://github.com/unjs/nitropack/commit/e33b6582b38e4d1adcd1be4e5fccccb09a5d9a0b))
- update runtime/config ([b979f74](https://github.com/unjs/nitropack/commit/b979f748878d89b9452555561451d7d2bf701b5d))
- update service-worker entry ([5874d01](https://github.com/unjs/nitropack/commit/5874d01c830086862ed557d43bebd0c10c3378d1))
- use `globalThis` instead of `global` ([#59](https://github.com/unjs/nitropack/issues/59)) ([fb56216](https://github.com/unjs/nitropack/commit/fb56216d3e8c193f561ad4345ce436a5cb9f34c9))
- use `perfect-debounce` ([#22](https://github.com/unjs/nitropack/issues/22)) ([5642e0d](https://github.com/unjs/nitropack/commit/5642e0d8660934c1665bc02b7acf89e9588f66a1))
- use allowlist approach to chunk name ([#101](https://github.com/unjs/nitropack/issues/101)) ([42f2269](https://github.com/unjs/nitropack/commit/42f226966265473cce5452f6a79ed42d3479825b)), closes [#93](https://github.com/unjs/nitropack/issues/93)
- use connect for dev server due to loading-screen issue ([67d78c8](https://github.com/unjs/nitropack/commit/67d78c87a5acbba483aa034fee3e2d296b179e09))
- use devalue to handle runtime config ([#28](https://github.com/unjs/nitropack/issues/28)) ([2522178](https://github.com/unjs/nitropack/commit/2522178f9ced253337fc8545212e666aa7f455ea))
- use dist for netlify as default ([d4d5285](https://github.com/unjs/nitropack/commit/d4d52859792168dea2796d96e2638f7db44941f9))
- use globalThis for client plugin ([34dbae8](https://github.com/unjs/nitropack/commit/34dbae8391071819117852356ffb7ee6388b60c9))
- use html.contents ([97d0ebe](https://github.com/unjs/nitropack/commit/97d0ebe1e75b4a4864681c38f59c1f0cb0a6d840))
- use native fetch when node is disabled ([4271c65](https://github.com/unjs/nitropack/commit/4271c6522cca80e9c067be26e025fec4f570113a))
- use nitro plugin with explicit mjs extension ([78135ac](https://github.com/unjs/nitropack/commit/78135acc4336e38f3d07f66a33f62f5a06a702ba))
- use output/public for prerenderer ([70c0866](https://github.com/unjs/nitropack/commit/70c086650b3f1e14562c6f0814f55e5001a96113))
- use same global to inject process.hrtime ([0303912](https://github.com/unjs/nitropack/commit/030391290e1a9c9c6338a06883f14a1d3362d213))
- use types dir for now ([#29](https://github.com/unjs/nitropack/issues/29)) ([2f27572](https://github.com/unjs/nitropack/commit/2f2757228e0a55bffb96fa22d00ffefe2dc1a60c))
- **vercel:** add `/index` suffix to dst ([601b413](https://github.com/unjs/nitropack/commit/601b41312ce8fe2d82b53c8f0a9ba400aea3eea9))
- **vercel:** add api prefix ([1fc0d9a](https://github.com/unjs/nitropack/commit/1fc0d9a55e95278a698305b99953050b0ceedc58))
- **vercel:** add missing node segment ([b68b4c9](https://github.com/unjs/nitropack/commit/b68b4c931ba8fc73a5bc1e80debbe03a46a42586))
- **vercel:** entry should export handle as default ([c8b1346](https://github.com/unjs/nitropack/commit/c8b13463b8ef7b8e41648b45b0fc28a05673e48a))
- **vercel:** generate to config/routes.json ([f9e35f6](https://github.com/unjs/nitropack/commit/f9e35f686b7b37256bb2f41132f7ae6f27eba97d))
- **vercel:** remove index.js from serverDir ([9ba1281](https://github.com/unjs/nitropack/commit/9ba1281d573f7965b4de48d9c86327dc3aa4325f))
- **vite:** don't copy `publicDir` files to `_nuxt` ([#2135](https://github.com/unjs/nitropack/issues/2135)) ([98f86e3](https://github.com/unjs/nitropack/commit/98f86e344f90ea45bfe292c418641dc931930543))
- **webpack:** use cjs for emitted webpack files ([#395](https://github.com/unjs/nitropack/issues/395)) ([aed8092](https://github.com/unjs/nitropack/commit/aed8092777feb85a406756b79f50407b4e6b21de))
- windows path issues ([#408](https://github.com/unjs/nitropack/issues/408)) ([4f118b6](https://github.com/unjs/nitropack/commit/4f118b62511d16287893b14bd4fbc5fd4e3f8db7))
- workaround for `vue` 3.2.18+ esm bundle issue and revert [#566](https://github.com/unjs/nitropack/issues/566) ([#578](https://github.com/unjs/nitropack/issues/578)) ([#578](https://github.com/unjs/nitropack/issues/578)) ([e60d22a](https://github.com/unjs/nitropack/commit/e60d22aa75a3dbde75a773fae6f037baa783f474))
- **worker:** smaller and working hrtime polyfill ([2f60ea4](https://github.com/unjs/nitropack/commit/2f60ea4ec49b7acd5929eef4caf6e30ac4a6e1ad))
- **worker:** wrap polyfill to iife ([3049212](https://github.com/unjs/nitropack/commit/3049212de55a296828b40d6670f6a512fe8c7271))

- expose `nitroApp` to entries ([4aa955f](https://github.com/unjs/nitropack/commit/4aa955f44d06d99c2790046f4b8f5d3ffc5ed6b6))
- simplify storage options ([cffb900](https://github.com/unjs/nitropack/commit/cffb90089834b65acbe8b8957a3b6a7631318d62))
- use `app.baseURL` runtime config for framework agnostic usage ([59196a6](https://github.com/unjs/nitropack/commit/59196a65266c227ce7a4cb6fa005eebe8cbfdaae))
