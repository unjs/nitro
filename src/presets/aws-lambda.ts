import { defineNitroPreset } from "../preset";
import { generateCdkApp } from "../utils/cdk";

export const awsLambda = defineNitroPreset({
  entry: `#internal/nitro/entries/aws-lambda-{{ awsLambda.target }}`,
  awsLambda: {
    // we need this defined here so it's picked up by the template in lambda entry
    target: (process.env.NITRO_AWSLAMBDA_TARGET || "default") as any,
  },
  hooks: {
    "rollup:before": (nitro) => {
      const target = nitro.options.awsLambda?.target as unknown;
      if (!target || target === "default") {
        nitro.logger.warn(
          "Nether `awsLambda.target` or `NITRO_AWSLAMBDA_GEN` is set. Set the target to remove this warning. See https://nitro.unjs.io/deploy/providers/aws-lambda for more information."
        );
        // Using the target single makes this preset backwards compatible for people already using it
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
