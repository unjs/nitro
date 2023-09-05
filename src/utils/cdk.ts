import { resolve } from "pathe";
import { Nitro } from "../types";
import { writeFile } from "../utils";

export async function generateCdkApp(nitro: Nitro) {
  if (nitro.options.awsLambda.target !== "edge") {
    // @todo implement regular construct
    return;
  }
  const cdkDir = resolve(nitro.options.output.dir, "cdk");
  await writeFile(resolve(cdkDir, "bin/nitro-lambda.ts"), entryEdgeTemplate());
  await writeFile(
    resolve(cdkDir, "lib/nitro-lambda-stack.ts"),
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
        jiti: "latest",
        typescript: "latest",
      },
      dependencies: {
        "aws-cdk-lib": "^2",
        constructs: "^10.0.0",
        "source-map-support": "^0.5.21",
      },
    })
  );
  await writeFile(
    resolve(cdkDir, "cdk.json"),
    JSON.stringify({
      app: "npx jiti bin/nitro-lambda.ts",
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
  nitro.logger.info("Generated CDK app !");
  nitro.logger.info(
    "Deploy: cd ./cdk && APP_ID=<your app id> npm run deploy --all"
  );
}

/** Templates */

function entryEdgeTemplate() {
  return /* ts */ `
  #!/usr/bin/env node
  import "source-map-support/register";
  import * as cdk from "aws-cdk-lib";
  import { NitroLambdaEdgeStack } from "../lib/nitro-lambda-stack";

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
  return /* ts */ `
  import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
  import { join } from "node:path";
  import { Construct } from "constructs";
  import { CfnOutput, RemovalPolicy, Stage, Stack, StackProps } from "aws-cdk-lib";
  import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
  import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
  import * as lambda from "aws-cdk-lib/aws-lambda";
  import * as s3 from "aws-cdk-lib/aws-s3";
  import * as s3deployment from "aws-cdk-lib/aws-s3-deployment";
  import { Asset, AssetProps } from "aws-cdk-lib/aws-s3-assets";


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

  interface ICloudFrontBehaviorResolver {
    resolve(key: string): cloudfront.BehaviorOptions;
  }

  /**
   * Static asset of nitro.
   * This Construct provides to resolve
   * additionalBehaviors of CloudFront Distribution easy.
   */
  class NitroStaticAsset implements s3deployment.ISource {
    /**
     * Directories under publicDir.
     */
    public readonly directories: string[];
    /**
     * files under publicDir.
     */
    public readonly files: string[];
    private readonly source: s3deployment.ISource;
    constructor(public readonly path: string) {
      const objects = readdirSync(path);
      this.directories = objects.filter((obj) =>
        statSync(join(path, obj)).isDirectory()
      );
      this.files = objects.filter((obj) => statSync(join(path, obj)).isFile());
      if (objects.length === 0) {
        writeFileSync(join(path, "dotfile"), "");
      }
      this.source = s3deployment.Source.asset(path);
    }

    bind(scope: Construct, context?: s3deployment.DeploymentSourceContext): s3deployment.SourceConfig {
      return this.source.bind(scope, context);
    }

    /**
     * helper function for aggregate behaviors every files and directories.
    */
    resolveCloudFrontBehaviors(
      resolver: ICloudFrontBehaviorResolver
    ): Record<string, cloudfront.BehaviorOptions> {
      return {
        ...this.directories.reduce<Record<string, cloudfront.BehaviorOptions>>(
          (acc, obj) => ({
            ...acc,
            [obj + "/*"]: resolver.resolve(obj),
          }),
          {}
        ),
        ...this.files.reduce<Record<string, cloudfront.BehaviorOptions>>(
          (acc, obj) => ({
            ...acc,
            [obj]: resolver.resolve(obj),
          }),
          {}
        ),
      };
    }
  }

  /**
  * Asset of nitro. This Construct can resolve nitro output path.
  */
  class NitroAsset extends Construct {
    readonly serverHandler: lambda.AssetCode;
    readonly staticAsset: NitroStaticAsset;

    constructor(scope: Construct, id: string, props: AssetProps) {
      super(scope, id);
      const project = new Asset(this, "NitroProject", props);
      const output = join(
        Stage.of(this)?.assetOutdir ?? "",
        project.assetPath,
        ".output"
      );
      const nitroJSON = JSON.parse(
        readFileSync(join(output, "nitro.json")).toString()
      ) as NitroJSON;

      this.serverHandler = lambda.Code.fromAsset(
        join(output, nitroJSON.output.serverDir)
      );
      this.staticAsset = new NitroStaticAsset(
        join(output, nitroJSON.output.publicDir)
      );
    }
  }

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
        value: "https://" + distribution.distributionDomainName,
      });
    }
  } `.trim();
}
