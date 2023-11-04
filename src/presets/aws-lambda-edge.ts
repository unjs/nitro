import { resolve } from "pathe";
import { defineNitroPreset } from "../preset";
import { Nitro } from "../types";
import { writeFile } from "../utils";

export const awsLambdaEdge = defineNitroPreset({
  entry: "#internal/nitro/entries/aws-lambda-edge",
  externals: true,
  commands: {
    deploy: "cd ./cdk && APP_ID=<your app id> npm run deploy --all",
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await generateCdkApp(nitro);
    },
  },
});

async function generateCdkApp(nitro: Nitro) {
  const cdkDir = resolve(nitro.options.output.dir, "cdk");
  await writeFile(resolve(cdkDir, "bin/nitro-lambda-edge.ts"), entryTemplate());
  await writeFile(
    resolve(cdkDir, "lib/nitro-lambda-edge-stack.ts"),
    nitroLambdaEdgeStackTemplate()
  );
  await writeFile(
    resolve(cdkDir, "package.json"),
    JSON.stringify({
      private: true,
      scripts: {
        cdk: "cdk",
        deploy: "npm install && cdk deploy",
      },
      devDependencies: {
        "@types/node": "18",
        "aws-cdk": "^2",
        "ts-node": "^10.7.0",
        typescript: "~3.9.7",
      },
      dependencies: {
        "aws-cdk-lib": "^2",
        constructs: "^10.0.0",
        "nitro-aws-cdk-lib": "latest",
        "source-map-support": "^0.5.21",
      },
    })
  );
  await writeFile(
    resolve(cdkDir, "cdk.json"),
    JSON.stringify({
      app: "npx ts-node --prefer-ts-exts bin/nitro-lambda-edge.ts",
    })
  );
  await writeFile(
    resolve(cdkDir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2018",
        module: "commonjs",
        lib: ["es2018"],
        declaration: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitThis: true,
        alwaysStrict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: false,
        inlineSourceMap: true,
        inlineSources: true,
        experimentalDecorators: true,
        strictPropertyInitialization: false,
        typeRoots: ["./node_modules/@types"],
      },
      exclude: ["node_modules", "cdk.out"],
    })
  );
}

function entryTemplate() {
  return `
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NitroLambdaEdgeStack } from "../lib/nitro-lambda-edge-stack";

if (!process.env.APP_ID) {
  throw new Error("$APP_ID is not set. Please rerun after set it.");
}

const app = new cdk.App();
new NitroLambdaEdgeStack(app, process.env.APP_ID, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
`.trim();
}

function nitroLambdaEdgeStackTemplate() {
  return `
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deployment from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { NitroAsset } from "nitro-aws-cdk-lib";

export class NitroLambdaEdgeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nitro = new NitroAsset(this, "NitroAsset", {
      path: "../../",
      exclude: ["cdk"],
    });
    const edgeFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "EdgeFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: nitro.serverHandler,
      }
    );
    const bucket = new s3.Bucket(this, "Bucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
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
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      httpVersion: cloudfront.HttpVersion.HTTP3,
    });
    new s3deployment.BucketDeployment(this, "Deployment", {
      sources: [nitro.staticAsset],
      destinationBucket: bucket,
      distribution,
    });
    new CfnOutput(this, "URL", {
      value: \`https://\${distribution.distributionDomainName}\`,
    });
  }
}
`.trim();
}
