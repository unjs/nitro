import type { Cookie } from "@azure/functions";
import { parse } from "cookie-es";
import { splitCookiesString } from "h3";
import { satisfies } from "semver";

export function getAzureParsedCookiesFromHeaders(
  headers: Record<string, number | string | string[] | undefined>
): Cookie[] {
  const raw = headers["set-cookie"];
  if (!raw || typeof raw === "number" || raw.length === 0) {
    return [];
  }
  const rawCookies = Array.isArray(raw) ? raw : splitCookiesString(String(raw));
  const cookies = rawCookies.flatMap((cookie) => {
    const entries = Object.entries(parse(cookie));
    console.log(parse(cookie), cookie);
    if (entries.length > 0) {
      const [entry, ...rest] = entries;
      return [
        {
          name: entry[0],
          value: entry[1],
          ...Object.fromEntries(
            rest.map(([key, value]) => [key.toLowerCase(), value])
          ),
        },
      ];
    }
    return [];
  });
  return cookies;
}
