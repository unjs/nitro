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

Nitro provides a built-in preset to generate output format compatible with [AWS Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html).

The output entrypoint in `.output/server/index.mjs` is compatible with [AWS Lambda@Edge format](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html).

### Deploy using AWS CDK

The following code is an example of deploying a Nuxt3 project to CloudFront and Lambda@Edge with [AWS CDK](https://github.com/aws/aws-cdk). Using this stack, paths under `_nuxt/` (static assets) will get their data from the S3 origin, and all other paths will be resolved by Lambda@Edge.

```ts
import { spawnSync } from "child_process";
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deployment from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class NitroLambdaEdgeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    spawnSync("yarn", ["build"], {
      stdio: "inherit",
      cwd: "<your-project-path>",
    });

    const edgeFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "EdgeFunction",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("<your-project-path>/.output/server"),
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
      additionalBehaviors: {
        "_nuxt/*": {
          origin: s3Origin,
        },
      },
    });
    new s3deployment.BucketDeployment(this, "Deployment", {
      sources: [s3deployment.Source.asset("<your-project-path>/.output/public")],
      destinationBucket: bucket,
      distribution,
    });
    new CfnOutput(this, "URL", {
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
```

::: Specify Region
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