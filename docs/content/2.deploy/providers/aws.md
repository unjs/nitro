# AWS Lambda

Deploy Nitro apps to AWS Lambda.

**Preset:** `aws-lambda` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro provides a built-in preset to generate output format compatible with [AWS Lambda](https://aws.amazon.com/lambda/).

The output entrypoint in `.output/server/index.mjs` is compatible with [AWS Lambda format](https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html).

It can be used programmatically or as part of a deployment.

```ts
import { handler } from './.output/server'

// Use programmatically
const { statusCode, headers, body } = handler({ rawPath: '/' })
```
## AWS Lambda@Edge

**Preset:** `aws-lambda-edge` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro provides a built-in preset to generate output format compatible with [AWS Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html).

The output entrypoint in `.output/server/index.mjs` is compatible with [AWS Lambda@Edge format](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html).
