import "#nitro/virtual/polyfills";
import { handleLambdaEvent } from "srvx/aws-lambda";
import { useNitroApp } from "nitro/app";
import { withServerEntryOptions } from "#nitro/runtime/serve";

import type { AwsLambdaEvent } from "srvx/aws-lambda";
import type { Context } from "aws-lambda";

const fetchHandler = withServerEntryOptions(useNitroApp().fetch);

export async function handler(event: AwsLambdaEvent, context: Context) {
  return handleLambdaEvent(fetchHandler, event, context);
}
