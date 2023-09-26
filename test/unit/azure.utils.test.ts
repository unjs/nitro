import { describe, it, expect } from "vitest";
import { getAzureParsedCookiesFromHeaders } from "../../src/runtime/utils.azure";

describe("getAzureParsedCookiesFromHeaders", () => {
  it("returns empty array if no cookies", () => {
    expect(getAzureParsedCookiesFromHeaders({})).toMatchObject([]);
  });
  it("returns empty array if no set-cookie header", () => {
    expect(
      getAzureParsedCookiesFromHeaders({ "set-cookie": undefined })
    ).toMatchObject([]);
  });
  it("returns empty array if empty set-cookie header", () => {
    expect(getAzureParsedCookiesFromHeaders({ "set-cookie": " " })).toMatchObject([]);
  });
  it("returns single cookie", () => {
    expect(
      getAzureParsedCookiesFromHeaders({ "set-cookie": "foo=bar" })
    ).toMatchObject([
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
    ).toMatchObject([
      {
        name: "foo",
        value: "bar",
        expires: new Date("1970-01-01T00:00:00.000Z"),
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
    ).toMatchObject([
      {
        name: "session",
        value: "xyz",
        expires: new Date("2024-03-24T09:13:27.000Z"),
        path: "/",
        sameSite: "Strict",
        httpOnly: true
      },
    ]);
  });
  it("returns multiple cookies", () => {
    expect(
      getAzureParsedCookiesFromHeaders({
        "set-cookie": ["foo=bar", "baz=qux"],
      })
    ).toMatchObject([
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
    ).toMatchObject([
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
