import { describe, it, expect } from "vitest";
import { retry } from "../../src/kit/utils";

describe("retry", () => {
  it("retries function", async () => {
    let counter = 0;

    const fn = async () => {
      if (!counter++) {
        throw new Error("deliberate");
      }
    };

    await retry(fn, 3);
    expect(counter).toEqual(2);
  });
  it("throws function", async () => {
    const fn = async () => {
      throw new Error("deliberate");
    };
    expect(await retry(fn, 2).catch(() => "thrown")).toEqual("thrown");
  });
});
