import { defineNitroPreset } from "../preset";
import { generateCdkApp } from "../utils/cdk";

export const awsLambda = defineNitroPreset({
  entry: `#internal/nitro/entries/aws-lambda-{{ awsLambda.target }}`,
  awsLambda: {
    // we need this defined here so it's picked up by the template in lambda entries
    target: (process.env.NITRO_AWSLAMBDA_TARGET || "default") as any,
  },
  hooks: {
    "rollup:before": (nitro) => {
      const target = nitro.options.awsLambda?.target as unknown;
      if (!target || target === "default") {
        nitro.logger.warn(
          "Neither `awsLambda.target` or `NITRO_AWSLAMBDA_GEN` is set. Set the target to remove this warning. See https://nitro.unjs.io/deploy/providers/aws-lambda for more information."
        );
        // Default to single lambda
        nitro.options.awsLambda = { target: "single" };
      }
    },
    async compiled(nitro) {
      if (
        nitro.options.awsLambda.target === "edge" &&
        nitro.options.awsLambda.cdk === true
      ) {
        await generateCdkApp(nitro);
      }
    },
  },
});
