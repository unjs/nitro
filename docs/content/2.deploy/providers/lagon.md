---
title: Lagon
description: "Discover Lagon preset for Nitro!"
---

**Preset:** `lagon` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro supports deploying on [Lagon](https://lagon.app/) with minimal configuration - see [documentation](https://docs.lagon.app/).

## Set up application

1. Build your Nitro app with `NITRO_PRESET=lagon`

1. Deploy with `lagon deploy .output/server/index.mjs -p .output/public`. Lagon will ask if you want to link to an existing function or create a new one.

You should be good to go!
