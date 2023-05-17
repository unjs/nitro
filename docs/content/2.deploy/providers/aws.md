# AWS Lambda

Deploy Nitro apps to AWS Lambda.

## AWS Lambda

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

::alert
**Zero Config Provider**
:br
Integration with this provider is possible with zero configuration. ([Learn More](/deploy/#zero-config-providers))
::

Nitro provides a built-in preset to generate output format compatible with [AWS Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html).

The output entrypoint in `.output/server/index.mjs` is compatible with [AWS Lambda@Edge format](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html).

::alert{type=warning}
**Bootstrap**
:br
Nitro uses [AWS CDK](https://github.com/aws/aws-cdk) for deploying Lambda@Edge.
If you are using AWS CDK for the first time on a region-by-region basis, you will need to run the following commands. 
```bash
npx cdk bootstrap \
  aws://<aws-account-id>/us-east-1 \
  aws://<aws-account-id>/<aws-region>
```
Lambda@Edge uses us-east-1, so be sure to include it in your bootstrap, even when deploying to a different region.
::

### Deploy from your local machine

To deploy, run the following commands.

```bash
NITRO_PRESET=aws-lambda-edge npm run build
cd .output/cdk
APP_ID=<app-id> npm run deploy --all
```

### Deploy from CI/CD via GitHub Actions

First, settings IAM Role following [these instructions](https://github.com/aws-actions/configure-aws-credentials#assuming-a-role) and add the IAM Role ARN as a secret to your GitHub repository.

Then create the following file as a workflow:

```yml
# .github/workflows/cdk.yml
name: cdk
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  deploy:
    env:
      APP_ID: <app-id>
    runs-on: ubuntu-latest
    name: Deploy to AWS
    permissions:
      id-token: write
      contents: read
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          role-to-assume: ${{ secrets.AWS_IAM_ROLE_ARN_TO_ASSUME }}
          aws-region: <your-aws-region>

      - name: Install Dependencies
        run: yarn

      - name: Build
        run: yarn build
        env:
          NITRO_PRESET: aws-lambda-edge

      - name: Install CDK Dependencies
        working-directory: .output/cdk
        run: yarn

      - name: Deploy to AWS Lambda@Edge
        working-directory: .output/cdk
        run: yarn cdk deploy --require-approval never --all
```

### Customize CDK App

<details>
<summary>Expand here to see</summary>
<div>

To customize it, you must create your own AWS CDK application.
Create your AWS CDK application with the following command.

```bash
mkdir nitro-lambda-edge && cd nitro-lambda-edge
npx cdk init app --language typescript
npm i nitro-aws-cdk-lib
```

The following code is an example of deploying a Nuxt3 project using custom domain to CloudFront and Lambda@Edge with AWS CDK. Using this stack, paths under `_nuxt/` (static assets) will get their data from the S3 origin, and all other paths will be resolved by Lambda@Edge.

```ts
// nitro-lambda-edge/lib/nitro-lambda-edge-stack.ts
import {
  CfnOutput,
  DockerImage,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deployment from "aws-cdk-lib/aws-s3-deployment";
import { spawnSync } from "child_process";
import { Construct } from "constructs";
import { NitroAsset } from "nitro-aws-cdk-lib";

export interface NitroLambdaEdgeStackProps extends StackProps {
  /**
   * Your site domain name.
   * @example example.com
   */
  readonly domainName: string;
  /**
   * Your site subdomain.
   * @example www
   * @default - Use domainName as it is.
   */
  readonly subdomain?: string;
}

export class NitroLambdaEdgeStack extends Stack {
  constructor(scope: Construct, id: string, props: NitroLambdaEdgeStackProps) {
    super(scope, id, props);

    // Resolve nitro server and public assets
    const nitro = new NitroAsset(this, "NitroAsset", {
      path: "<path-to-your-nitro-app-project>",
      // Uncomment this option if you are creating a CDK app inside a nitro project.
      // exclude: ["nitro-lambda-edge"],

      // Uncomment this option if you want to build nitro app from CDK app.
      // bundling: {
      //   workingDirectory: "<path-to-your-nitro-app-project>",
      //   image: DockerImage.fromRegistry('node:lts'),
      //   local: {
      //     tryBundle(outputDir, options) {
      //       const spawnOptions =  {
      //         stdio: "inherit" as const,
      //         cwd: options.workingDirectory
      //       }
      //       spawnSync('yarn', ['install'], spawnOptions)
      //       spawnSync('yarn', ['build'], spawnOptions)
      //       spawnSync('cp', ['-Rf', '.output', outputDir], spawnOptions)
      //       return true
      //     },
      //   }
      // }
    });

    // Lambda@Edge with working Nitro server code
    const edgeFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "EdgeFunction",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "index.handler",
        code: nitro.serverHandler,
      }
    );

    // Static assets bucket
    const bucket = new s3.Bucket(this, "Bucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });
    const siteDomain = [props.subdomain, props.domainName]
      .filter((v) => !!v)
      .join(".");
    new CfnOutput(this, "URL", {
      value: `https://${siteDomain}`,
    });

    // TLS certificate
    const certificate = new acm.DnsValidatedCertificate(this, "Certificate", {
      domainName: siteDomain,
      hostedZone,
      region: "us-east-1", // always must be set us-east-1
    });

    // CloudFront distribution
    const s3Origin = new origins.S3Origin(bucket);
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      certificate,
      domainNames: [siteDomain],
      defaultBehavior: {
        origin: s3Origin,
        edgeLambdas: [
          {
            functionVersion: edgeFunction.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
          },
        ],
      },
      additionalBehaviors: nitro.staticAsset.resolveCloudFrontBehaviors({
        resolve: () => ({
          origin: s3Origin,
        }),
      }),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      httpVersion: cloudfront.HttpVersion.HTTP3,
    });
    new route53.ARecord(this, "AliasRecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      zone: hostedZone,
    });

    // Deploy static assets to S3 bucket
    new s3deployment.BucketDeployment(this, "Deployment", {
      sources: [nitro.staticAsset],
      destinationBucket: bucket,
      distribution,
    });
  }
}
```

```ts
// nitro-lambda-edge/bin/nitro-lambda-edge.ts
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NitroLambdaEdgeStack } from "../lib/nitro-lambda-edge-stack";

const app = new cdk.App();
new NitroLambdaEdgeStack(app, "NitroLambdaEdgeStack", {
  domainName: "your-site.com",
  subdomain: "www",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

</div>
</details>