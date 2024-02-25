import "#internal/nitro/virtual/polyfill";
import type {
  Request as CFRequest,
  EventContext,
} from "@cloudflare/workers-types";
import wsAdapter from "crossws/adapters/cloudflare";
import { requestHasBody } from "#internal/nitro/utils";
import { nitroApp } from "#internal/nitro/app";
import { isPublicAssetURL } from "#internal/nitro/virtual/public-assets";

/**
 * Reference: https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#parameters
 */

interface CFPagesEnv {
  ASSETS: { fetch: (request: CFRequest) => Promise<Response> };
  CF_PAGES: "1";
  CF_PAGES_BRANCH: string;
  CF_PAGES_COMMIT_SHA: string;
  CF_PAGES_URL: string;
  [key: string]: any;
}

const { handleUpgrade } = import.meta._websocket
  ? wsAdapter(nitroApp.h3App.websocket)
  : undefined;

export default {
  async fetch(
    request: CFRequest,
    env: CFPagesEnv,
    context: EventContext<CFPagesEnv, string, any>
  ) {
    // Websocket upgrade
    if (
      import.meta._websocket &&
      request.headers.get("upgrade") === "websocket"
    ) {
      return handleUpgrade(request as any, env, context);
    }

    const url = new URL(request.url);
    if (env.ASSETS /* !miniflare */ && isPublicAssetURL(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    let body;
    if (requestHasBody(request as unknown as Request)) {
      body = Buffer.from(await request.arrayBuffer());
    }

    // Expose latest env to the global context
    globalThis.__env__ = env;

    return nitroApp.localFetch(url.pathname + url.search, {
      context: {
        cf: request.cf,
        waitUntil: (promise) => context.waitUntil(promise),
        cloudflare: {
          request,
          env,
          context,
        },
      },
      host: url.hostname,
      protocol: url.protocol,
      method: request.method,
      headers: request.headers as unknown as Headers,
      body,
    });
  },
};
