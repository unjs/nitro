import type { OpenAPI3 } from "openapi-typescript";
import { isCI } from "std-env";
import { describe, expect, it } from "vitest";
import { setupTest, testNitro } from "../tests";

describe.skipIf(isCI)("nitro:preset:nitro-dev", async () => {
  const ctx = await setupTest("nitro-dev");
  testNitro(
    ctx,
    () => {
      return async ({ url, headers, method, body }) => {
        const res = await ctx.fetch(url, {
          headers,
          method,
          body,
        });
        return res;
      };
    },
    (_ctx, callHandler) => {
      it("returns correct status for devProxy", async () => {
        const { status } = await callHandler({ url: "/proxy/example" });
        expect(status).toBe(200);
      });

      describe("openAPI", () => {
        let spec: OpenAPI3;
        it("/_nitro/openapi.json", async () => {
          spec = ((await callHandler({ url: "/_nitro/openapi.json" })) as any)
            .data;
          expect(spec.openapi).to.match(/^3\.\d+\.\d+$/);
          expect(spec.info.title).toBe("Nitro Test Fixture");
          expect(spec.info.description).toBe("Nitro Test Fixture API");
        });

        it("defineRouteMeta works", () => {
          expect(spec.paths?.["/api/meta/test"]).toMatchInlineSnapshot(`
            {
              "get": {
                "description": "Test route description",
                "parameters": [
                  {
                    "in": "query",
                    "name": "test",
                    "required": true,
                  },
                ],
                "responses": {
                  "200": {
                    "description": "OK",
                  },
                },
                "tags": [
                  "test",
                ],
              },
            }
          `);
        });
      });
    }
  );
});
