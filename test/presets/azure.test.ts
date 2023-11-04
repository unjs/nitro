import { promises as fsp } from "node:fs";
import { resolve } from "pathe";
import { describe, it, expect } from "vitest";
import { fixtureDir, setupTest } from "../tests";

describe(
  "nitro:preset:azure",
  async () => {
    const customConfig = {
      routes: [
        {
          route: "/admin",
          allowedRoles: ["authenticated"],
        },
        {
          route: "/logout",
          redirect: "/.auth/logout",
        },
        {
          route: "/index.html",
          redirect: "/overridden-index",
        },
        {
          route: "/",
          rewrite: "/api/server/overridden",
        },
      ],
      responseOverrides: {
        401: {
          statusCode: 302,
          redirect: "/.auth/login/aad",
        },
      },
      networking: {
        allowedIpRanges: ["10.0.0.0/24", "100.0.0.0/32", "192.168.100.0/22"],
      },
      platform: {
        apiRuntime: "custom-runtime",
      },
    };

    const ctx = await setupTest("azure", {
      config: {
        azure: {
          config: customConfig,
        },
      },
    });

    const config = await fsp
      .readFile(resolve(ctx.rootDir, "staticwebapp.config.json"), "utf8")
      .then((r) => JSON.parse(r));

    it("generated the correct config", () => {
      expect(config).toMatchInlineSnapshot(`
        {
          "navigationFallback": {
            "rewrite": "/api/server",
          },
          "networking": {
            "allowedIpRanges": [
              "10.0.0.0/24",
              "100.0.0.0/32",
              "192.168.100.0/22",
            ],
          },
          "platform": {
            "apiRuntime": "custom-runtime",
          },
          "responseOverrides": {
            "401": {
              "redirect": "/.auth/login/aad",
              "statusCode": 302,
            },
          },
          "routes": [
            {
              "allowedRoles": [
                "authenticated",
              ],
              "route": "/admin",
            },
            {
              "redirect": "/.auth/logout",
              "route": "/logout",
            },
            {
              "rewrite": "/api/hey/index.html",
              "route": "/api/hey",
            },
            {
              "rewrite": "/prerender/index.html",
              "route": "/prerender",
            },
            {
              "redirect": "/overridden-index",
              "route": "/index.html",
            },
            {
              "rewrite": "/api/server/overridden",
              "route": "/",
            },
          ],
        }
      `);
    });
  },
  { timeout: 10_000 }
);
