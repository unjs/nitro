import { promises as fsp } from 'fs'
import { resolve } from 'pathe'
import { defineNitroPreset } from '../preset'
import { Nitro } from '../types'
import { writeFile } from '../utils'

export const awsLambdaEdge = defineNitroPreset({
  entry: '#internal/nitro/entries/aws-lambda-edge',
  externals: true,
  commands: {
    deploy: 'cd ./cdk && APP_ID=<your app id> npm run deploy'
  },
  hooks: {
    async 'compiled' (nitro: Nitro) {
      await generateCdkApp(nitro)
    }
  }
})

async function generateCdkApp (nitro: Nitro) {
  const cdkDir = resolve(nitro.options.output.dir, 'cdk')
  await fsp.mkdir(resolve(nitro.options.output.dir, 'cdk'))
  await writeFile(resolve(cdkDir, 'bin/nitro-lambda-edge.ts'), entryTemplate())
  await writeFile(resolve(cdkDir, 'lib/nitro-asset.ts'), nitroAssetTemplate())
  await writeFile(resolve(cdkDir, 'lib/nitro-lambda-edge-stack.ts'), nitroLambdaEdgeStackTemplate())
  await writeFile(resolve(cdkDir, 'package.json'), JSON.stringify({
    private: true,
    scripts: {
      deploy: 'npm install && cdk deploy'
    },
    devDependencies: {
      '@types/node': '18',
      'aws-cdk': '^2',
      'ts-node': '^10.7.0',
      typescript: '~3.9.7'
    },
    dependencies: {
      'aws-cdk-lib': '^2',
      constructs: '^10.0.0',
      'source-map-support': '^0.5.21'
    }
  }))
  await writeFile(resolve(cdkDir, 'cdk.json'), JSON.stringify({
    app: 'npx ts-node --prefer-ts-exts bin/nitro-lambda-edge.ts'
  }))
  await writeFile(resolve(cdkDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2018',
      module: 'commonjs',
      lib: ['es2018'],
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
      typeRoots: ['./node_modules/@types']
    },
    exclude: ['node_modules', 'cdk.out']
  }))
}

function entryTemplate () {
  return `
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NitroLambdaEdgeStack } from "../lib/nitro-lambda-edge-stack";

if (!process.env.APP_ID) {
  throw new Error("$APP_ID is not set. Please rerun after set that.");
}

const app = new cdk.App();
new NitroLambdaEdgeStack(app, process.env.APP_ID, {
  env: {
    region: process.env.REGION ?? "us-east-1",
  },
});
`.trim()
}

function nitroLambdaEdgeStackTemplate () {
  return `
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
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
      path: "../../",
      exclude: ["cdk"],
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
      value: \`https://\${distribution.distributionDomainName}\`,
    });
  }
}
`.trim()
}

function nitroAssetTemplate () {
  return `
import { AssetCode, Code } from "aws-cdk-lib/aws-lambda";
import { Asset, AssetProps } from "aws-cdk-lib/aws-s3-assets";
import {
  DeploymentSourceContext,
  ISource,
  Source,
  SourceConfig,
} from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";
import * as fs from "fs";
import { BehaviorOptions } from "aws-cdk-lib/aws-cloudfront";

export interface CloudFrontBehaviorResolver {
  resolve: (key: string) => BehaviorOptions;
}

export class NitroStaticAsset implements ISource {
  public readonly directories: string[];
  public readonly files: string[];
  private readonly source: ISource;
  constructor(publicDir: string) {
    const objects = fs.readdirSync(publicDir);
    this.directories = objects.filter((obj) =>
      fs.statSync(path.join(publicDir, obj)).isDirectory()
    );
    this.files = objects.filter((obj) =>
      fs.statSync(path.join(publicDir, obj)).isFile()
    );
    if (!objects.length) {
      fs.writeFileSync(path.join(publicDir, "dotfile"), "");
    }
    this.source = Source.asset(publicDir);
  }

  bind(
    scope: Construct,
    context?: DeploymentSourceContext | undefined
  ): SourceConfig {
    return this.source.bind(scope, context);
  }

  resolveCloudFrontBehaviors(
    resolver: CloudFrontBehaviorResolver
  ): Record<string, BehaviorOptions> {
    return {
      ...this.directories.reduce<Record<string, BehaviorOptions>>(
        (acc, obj) => ({
          ...acc,
          [\`\${obj}/*\`]: resolver.resolve(obj),
        }),
        {}
      ),
      ...this.files.reduce<Record<string, BehaviorOptions>>(
        (acc, obj) => ({
          ...acc,
          [obj]: resolver.resolve(obj),
        }),
        {}
      ),
    };
  }
}

interface NitroJSON {
  date: string;
  preset: string;
  commands: {
    preview?: string;
    deploy?: string;
  };
  output: {
    serverDir: string;
    publicDir: string;
  };
}

export class NitroAsset extends Construct {
  readonly serverHandler: AssetCode;
  readonly staticAsset: NitroStaticAsset;

  constructor(scope: Construct, id: string, props: AssetProps) {
    super(scope, id);
    const nitroOutput = new Asset(this, "NitroOutput", props);
    const nitroJSON = JSON.parse(
      fs
        .readFileSync(
          path.join("cdk.out", nitroOutput.assetPath, ".output/nitro.json")
        )
        .toString()
    ) as NitroJSON;

    this.serverHandler = Code.fromAsset(
      path.join("cdk.out", nitroOutput.assetPath, ".output", nitroJSON.output.serverDir)
    );
    this.staticAsset = new NitroStaticAsset(
      path.join("cdk.out", nitroOutput.assetPath, ".output", nitroJSON.output.publicDir)
    );
  }
}
`.trim()
}
