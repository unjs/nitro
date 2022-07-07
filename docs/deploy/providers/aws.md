# AWS Lambda

**Preset:** `aws-lambda` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro provides a built-in preset to generate output format compatible with [AWS Lambda](https://aws.amazon.com/lambda/).

The output entrypoint in `.output/server/index.mjs` is compatible with [AWS Lambda format](https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html).

It can be used programmatically or as part of a deployment.

```ts
import { handler } from './.output/server'

// Use programmatically
const { statusCode, headers, body } = handler({ rawPath: '/' })
```

# AWS Lambda@Edge

**Preset:** `aws-lambda-edge` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::: info Zero Config Provider
Integration with this provider is possible with zero configuration. ([Learn More](/deploy/#zero-config-providers))
:::

Nitro provides a built-in preset to generate output format compatible with [AWS Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html).

The output entrypoint in `.output/server/index.mjs` is compatible with [AWS Lambda@Edge format](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html).

### Deploy using AWS CDK

To deploy, run the following command:

```sh
NITRO_PRESET=aws-lambda-edge npm run build
cd .output/cdk
APP_ID=<app-name> npm run deploy
# To using specific region
# REGION=<your region> APP_ID=<app-name> npm run deploy
```

::: warning Specify Region
If you are using CDK for the first time on a region-by-region basis, you will need to run the following commands
```sh
npx cdk bootstrap
```
:::

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
      APP_ID: <your-app-id>
      REGION: <your-aws-region>
    runs-on: ubuntu-latest
    name: Deploy per pull request
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
          aws-region: ${ REGION }

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
        run: yarn cdk deploy --require-approval never
```

### Customize CDK App

<details>
<summary>Please check the example code.</summary>
<div>

The following code is an example of deploying a Nuxt3 project to CloudFront and Lambda@Edge with [AWS CDK](https://github.com/aws/aws-cdk). Using this stack, paths under `_nuxt/` (static assets) will get their data from the S3 origin, and all other paths will be resolved by Lambda@Edge.

```ts
import { spawnSync } from "child_process";
import { CfnOutput, DockerImage, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deployment from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { NitroAsset } from "./nitro-asset";

export class NitroLambdaEdgeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nitro = new NitroAsset(this, "NitroAsset", {
      path: "<path-to-your-nitro-app-project>",
      exclude: ["cdk"],
      // uncomment this code to building nitro app in CDK app
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
    const edgeFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "EdgeFunction",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "index.handler",
        code: nitro.serverHandler,
      }
    );
    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const s3Origin = new origins.S3Origin(bucket);
    const distribution = new cloudfront.Distribution(this, "Distribution", {
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
    });
    new s3deployment.BucketDeployment(this, "Deployment", {
      sources: [nitro.staticAsset],
      destinationBucket: bucket,
      distribution,
    });
    new CfnOutput(this, "URL", {
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
```

::: warning Specify Region
Note that the region must be specified when using the code above.
:::

```ts
const app = new cdk.App();
new NitroLambdaEdgeStack(app, "NitroLambdaEdgeStack", {
  env: {
    region: "your AWS region", // need this line
  },
});
```

</div>
</details>