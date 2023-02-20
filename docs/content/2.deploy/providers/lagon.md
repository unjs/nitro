---
title: Lagon
description: "Discover Lagon preset for Nitro!"
---

> Lagon is an open source platform that allows you to run TypeScript and JavaScript close to your users.

🚧 This is an early access and in progress preset. Please followup via [unjs/nitro#966](https://github.com/unjs/nitro/issues/966)

**Preset:** `lagon` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying on [Lagon](https://lagon.app/) with minimal configuration - see [documentation](https://docs.lagon.app/).

## Set up application

1. Build your Nitro app with `NITRO_PRESET=lagon`

1. Install [Lagon CLI](https://docs.lagon.app/cli) and login using [`npx @lagon/cli login`]

1. Deploy with `lagon deploy .output/server/index.mjs -p .output/public`. Lagon will ask if you want to link to an existing function or create a new one.

You should be good to go!
