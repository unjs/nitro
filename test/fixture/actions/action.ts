import {
  getQuery,
  type EventHandler,
  type H3Event,
  defineEventHandler,
  readBody,
} from "h3";

interface Actions {
  [key: string]: EventHandler;
}

function defineFormActions(actions: Actions) {
  return (event: H3Event) => {
    const action = Object.keys(getQuery(event))[0];
    const handler = action ? actions[action] : Object.values(actions)[0];
    return defineEventHandler(handler(event));
  };
}

async function respondWithResponse(event: H3Event, response: Response) {
  // @ts-expect-error
  for (const [key, value] of response.headers) {
    event.node.res.setHeader(key, value);
  }

  if (response.body) {
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("text") || contentType.includes("json")) {
      for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
        const stringChunk = new TextDecoder().decode(chunk); // Convert chunk to string
        event.node.res.write(stringChunk);
      }
    } else {
      // for binary data like images, videos, etc.
      for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
        event.node.res.write(chunk);
      }
    }
  }
  return event.node.res.end();
}

function actionResponse(event: H3Event, data: any, action?: any) {
  return respondWithResponse(
    event,
    new Response(JSON.stringify({ data, action }), { status: 200 })
  );
}

export default defineFormActions({
  default: async (event) => {
    const body = await readBody(event);
    return actionResponse(event, { ...body });
  },
});
