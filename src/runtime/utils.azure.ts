import type { Cookie } from "@azure/functions";
import { parse } from "cookie-es";
import { splitCookiesString } from "h3";

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
    if (entries.length > 0) {
      const [entry, ...rest] = entries;
      const options = Object.fromEntries(
        rest.map(([k, v]) => [k.toLowerCase(), v])
      );
      const res = {
        name: entry[0],
        value: entry[1],
        domain: options.domain,
        path: options.path,
        expires: parseNumberOrDate(options.expires),
        // secure: options.secure,
        // httponly: options.httponly,
        samesite: options.samesite,
        maxAge: parseNumber(options.maxAge),
      } as Cookie;
      for (const key in res) {
        if (res[key] === undefined) {
          delete res[key];
        }
      }
      return [res];
    }
    return [];
  });
  return cookies;
}

function parseNumberOrDate(expires: string) {
  const expiresAsNumber = parseNumber(expires);
  if (expiresAsNumber !== undefined) {
    return expiresAsNumber;
  }
  // Convert to Date if possible
  const expiresAsDate = new Date(expires);
  if (!Number.isNaN(expiresAsDate.getTime())) {
    return expiresAsDate;
  }
}

function parseNumber(maxAge: string) {
  if (!maxAge) {
    return undefined;
  }
  // Convert to number if possible
  const maxAgeAsNumber = Number(maxAge);
  if (!Number.isNaN(maxAgeAsNumber)) {
    return maxAgeAsNumber;
  }
}
