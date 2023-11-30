import { describe, it, expect } from "vitest";
import { applyEnv } from "../../src/runtime/utils.env";

describe("env utils", () => {
  describe("applyEnv", () => {
    const tests = [
      {
        config: { a: 1, b: 2 },
        env: { NITRO_A: "123" },
        expected: { a: 123, b: 2 },
      },
      {
        config: { feature: { options: { optionA: true, optionB: true } } },
        env: { NITRO_FEATURE: false },
        expected: { feature: false },
      },
      {
        config: { feature: { options: { optionA: true, optionB: true } } },
        env: { NITRO_FEATURE_OPTIONS: false },
        expected: { feature: { options: false } },
      },
    ];
    for (const test of tests) {
      it(`Config: ${JSON.stringify(test.config)} Env: { ${Object.entries(
        test.env
      )
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(" ")} }`, () => {
        for (const key in test.env) {
          process.env[key] = test.env[key];
        }
        expect(applyEnv(test.config, { prefix: "NITRO_" })).toEqual(
          test.expected
        );
        for (const key in test.env) {
          delete process.env[key];
        }
      });
    }
  });
});
