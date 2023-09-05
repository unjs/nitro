import { existsSync } from "node:fs";
import { resolve, join } from "pathe";
import { Nitro } from "../types";
import { writeFile } from "../utils";
import { PresetOptions } from "../types/presets";

export async function generateSST(nitro: Nitro) {
  const sstDir = resolve(nitro.options.output.dir, "sst-stacks");
  // Write SST stack
  await writeFile(resolve(sstDir, "index.ts"), nitroAppTemplate());

  // Write SST config
  if (existsSync(join(nitro.options.rootDir, "sst.config.ts"))) {
    nitro.logger.warn(
      "`sst.config.ts` already exists, nitro.awsLambda.sstOptions will be ignored."
    );
  } else {
    await writeFile(
      resolve(nitro.options.rootDir, "sst.config.ts"),
      sstConfigTemplate({
        edge: nitro.options.awsLambda?.target === "edge",
        sstOptions: nitro.options.awsLambda?.sstOptions,
        sstDir,
      })
    );
  }

  nitro.logger.info(
    `
    Generated SST app !
    Install SST dependencies: "npm i -D sst aws-cdk-lib constructs"

        - Dev: "npx sst dev"
        - Build: "npx sst build"
        - Deploy: "npx sst deploy"
        - Remove: "npx sst remove"
        - Console: "npx sst console
    `
  );
}

const sstConfigTemplate = ({
  edge = false,
  sstOptions,
  sstDir,
}: {
  edge: boolean;
  sstOptions: PresetOptions["awsLambda"]["sstOptions"];
  sstDir: string;
}) =>
  /* ts */ `
import { SSTConfig } from "sst";
import { NitroApp } from "${sstDir}";

export default {
  config(_input) {
    return {
      ${optionsToString({ name: "nitro", region: "us-east-1", ...sstOptions })}
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const app = new NitroApp(stack, "app", {
        path: "./",
        edge: ${edge ? "true" : "false"},
      });

      stack.addOutputs({
        url: app.url,
      });
    });
  }
} satisfies SSTConfig;`.trim();

function optionsToString(
  obj?: PresetOptions["awsLambda"]["sstOptions"],
  indent = "      "
): string {
  if (!obj) {
    return "";
  }
  return Object.entries(obj)
    .map(([key, value]) => {
      return typeof value === "object" && value !== null
        ? `${key}: {\n${optionsToString(value, indent + "  ")}\n${indent}}`
        : `${key}: ${JSON.stringify(value)}`;
    })
    .join(",\n" + indent);
}

const nitroAppTemplate = () =>
  /* ts */ `
import fs from "node:fs"
import path from "node:path";
import type { Function as CdkFunction } from "aws-cdk-lib/aws-lambda";

import { SsrSite } from "sst/constructs/SsrSite.js";
import { SsrFunction } from "sst/constructs/SsrFunction.js";
import { EdgeFunction } from "sst/constructs/EdgeFunction.js";

export class NitroApp extends SsrSite {
  public getConstructMetadata() {
    return {
      type: "NitroApp" as const,
      ...this.getConstructMetadataBase(),
    };
  }

  protected initBuildConfig() {
    return {
      typesPath: "./",
      serverBuildOutputFile: ".output/server/index.mjs",
      clientBuildOutputDir: ".output/public",
      clientBuildVersionedSubDir: ".output",
    };
  }

  protected validateBuildOutput() {
    const serverDir = path.join(this.props.path, ".output/server");
    const clientDir = path.join(this.props.path, ".output/public");
    if (!fs.existsSync(serverDir) || !fs.existsSync(clientDir)) {
      throw new Error(
        'Build output inside ".output/" does not contain the "server" and "public" folders.'
      );
    }

    super.validateBuildOutput();
  }

  protected createFunctionForRegional(): CdkFunction {
    const {
      runtime,
      timeout,
      memorySize,
      permissions,
      environment,
      nodejs,
      bind,
      cdk,
    } = this.props;

    const ssrFn = new SsrFunction(this, "ServerFunction", {
      description: "Server handler for Nuxt",
      handler: path.join(this.props.path, ".output", "server", "index.handler"),
      runtime,
      memorySize,
      timeout,
      nodejs: {
        format: "esm",
        ...nodejs,
      },
      bind,
      environment,
      permissions,
      ...cdk?.server,
    });

    return ssrFn.function;
  }

  protected createFunctionForEdge(): EdgeFunction {
    const {
      runtime,
      timeout,
      memorySize,
      bind,
      permissions,
      environment,
      nodejs,
    } = this.props;

    return new EdgeFunction(this, "EdgeFunction", {
      scopeOverride: this,
      handler: path.join(this.props.path, ".output", "server", "index.handler"),
      runtime,
      timeout,
      memorySize,
      bind,
      environment,
      permissions,
      nodejs: {
        format: "esm",
        ...nodejs,
      },
    });
  }
}
`.trim();
