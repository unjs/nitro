import "#nitro/virtual/polyfills";
import { handleLambdaEventWithStream } from "srvx/aws-lambda";
import { useNitroApp } from "nitro/app";
import { withServerEntryOptions } from "#nitro/runtime/serve";

const fetchHandler = withServerEntryOptions(useNitroApp().fetch);

export const handler = awslambda.streamifyResponse((event, responseStream, context) =>
  handleLambdaEventWithStream(fetchHandler, event, responseStream, context)
);
