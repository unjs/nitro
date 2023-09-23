import { describe, it, expect } from "vitest";
import { getAzureParsedCookiesFromHeaders } from "../../src/runtime/utils.azure";

describe("getAzureParsedCookiesFromHeaders", () => {
  it("returns empty array if no cookies", () => {
    expect(getAzureParsedCookiesFromHeaders({})).toEqual([]);
  });
  it("returns empty array if no set-cookie header", () => {
    expect(
      getAzureParsedCookiesFromHeaders({ "set-cookie": undefined })
    ).toEqual([]);
  });
  it("returns empty array if empty set-cookie header", () => {
    expect(getAzureParsedCookiesFromHeaders({ "set-cookie": " " })).toEqual([]);
  });
  it("returns single cookie", () => {
    expect(
      getAzureParsedCookiesFromHeaders({ "set-cookie": "foo=bar" })
    ).toEqual([
      {
        name: "foo",
        value: "bar",
      },
    ]);
  });
  it('returns cookie with "expires" attribute', () => {
    expect(
      getAzureParsedCookiesFromHeaders({
        "set-cookie": "foo=bar; expires=Thu, 01 Jan 1970 00:00:00 GMT",
      })
    ).toEqual([
      {
        name: "foo",
        value: "bar",
        expires: "Thu, 01 Jan 1970 00:00:00 GMT",
      },
    ]);
  });
  it("returns a complex cookie", () => {
    expect(
      getAzureParsedCookiesFromHeaders({
        "set-cookie": [
          "session=xyz; Path=/; Expires=Sun, 24 Mar 2024 09:13:27 GMT; HttpOnly; SameSite=Strict",
        ],
      })
    ).toEqual([
      {
        name: "session",
        value: "xyz",
        expires: "Sun, 24 Mar 2024 09:13:27 GMT",
        path: "/",
        // TODO: httponly: true,
        samesite: "Strict",
      },
    ]);
  });
  it("returns multiple cookies", () => {
    expect(
      getAzureParsedCookiesFromHeaders({
        "set-cookie": ["foo=bar", "baz=qux"],
      })
    ).toEqual([
      {
        name: "foo",
        value: "bar",
      },
      {
        name: "baz",
        value: "qux",
      },
    ]);
  });
  it("returns multiple cookies given as string", () => {
    expect(
      getAzureParsedCookiesFromHeaders({
        "set-cookie": "foo=bar, baz=qux",
      })
    ).toEqual([
      {
        name: "foo",
        value: "bar",
      },
      {
        name: "baz",
        value: "qux",
      },
    ]);
  });
});
