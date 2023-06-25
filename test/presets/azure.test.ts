import { promises as fsp } from "node:fs";
import { resolve } from "pathe";
import { describe, it, expect, beforeEach } from "vitest";
import { fixtureDir, setupTest } from "../tests";

describe("nitro:preset:azure", () => {
  beforeEach(async () => {
    // Attempt to delete existing configs
    await fsp
      .rm(resolve(fixtureDir, "custom.staticwebapp.config.json"))
      .catch(() => {});
    await fsp
      .rm(resolve(fixtureDir, "staticwebapp.config.json"))
      .catch(() => {});
  });

  it("basic staticwebapp.config.json created successfully", async () => {
    const ctx = await setupTest("azure");
    const config = await fsp
      .readFile(resolve(ctx.rootDir, "staticwebapp.config.json"), "utf8")
      .then((r) => JSON.parse(r));
    expect(config).toMatchInlineSnapshot(`
      {
        "navigationFallback": {
          "rewrite": "/api/server",
        },
        "platform": {
          "apiRuntime": "node:16",
        },
        "routes": [
          {
            "rewrite": "/api/param/prerender3/index.html",
            "route": "/api/param/prerender3",
          },
          {
            "rewrite": "/api/param/prerender1/index.html",
            "route": "/api/param/prerender1",
          },
          {
            "rewrite": "/api/param/foo.json/index.html",
            "route": "/api/param/foo.json",
          },
          {
            "rewrite": "/api/hey/index.html",
            "route": "/api/hey",
          },
          {
            "rewrite": "/api/param/prerender4/index.html",
            "route": "/api/param/prerender4",
          },
          {
            "rewrite": "/prerender/index.html",
            "route": "/prerender",
          },
          {
            "redirect": "/",
            "route": "/index.html",
          },
          {
            "rewrite": "/api/server",
            "route": "/",
          },
        ],
      }
    `);
  });

  it("custom configuration applied correctly", async () => {
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

    // Write config out
    await fsp.writeFile(
      resolve(fixtureDir, "custom.staticwebapp.config.json"),
      JSON.stringify(customConfig, null, 2)
    );

    const ctx = await setupTest("azure");
    const config = await fsp
      .readFile(resolve(ctx.rootDir, "staticwebapp.config.json"), "utf8")
      .then((r) => JSON.parse(r));

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
            "rewrite": "/api/param/prerender3/index.html",
            "route": "/api/param/prerender3",
          },
          {
            "rewrite": "/api/param/prerender1/index.html",
            "route": "/api/param/prerender1",
          },
          {
            "rewrite": "/api/param/foo.json/index.html",
            "route": "/api/param/foo.json",
          },
          {
            "rewrite": "/api/hey/index.html",
            "route": "/api/hey",
          },
          {
            "rewrite": "/api/param/prerender4/index.html",
            "route": "/api/param/prerender4",
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
});
