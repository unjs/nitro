---
title: AWS Lambda
description: "Discover AWS Lambda preset for Nitro!"
---

**Preset:** `aws-lambda` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro provides a built-in preset to generate output format compatible with [AWS Lambda](https://aws.amazon.com/lambda/).

The output entrypoint in `.output/server/index.mjs` is compatible with [AWS Lambda format](https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html).

It can be used programmatically or as part of a deployment.

```ts
import { handler } from "./.output/server";

// Use programmatically
const { statusCode, headers, body } = handler({ rawPath: "/" });
```
