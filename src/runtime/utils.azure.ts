import type { Cookie, HttpRequest } from "@azure/functions";
import { parse } from "cookie-es";
import { splitCookiesString } from "h3";

export function getAzureParsedCookiesFromHeaders(
  headers: Record<string, number | string | string[] | undefined>
): Cookie[] {
  const setCookieHeader = headers["set-cookie"];
  if (
    !setCookieHeader ||
    typeof setCookieHeader === "number" ||
    setCookieHeader.length === 0
  ) {
    return [];
  }
  const azureCookies: Cookie[] = [];
  for (const setCookieStr of splitCookiesString(setCookieHeader)) {
    const setCookie = Object.entries(parse(setCookieStr));
    if (setCookie.length === 0) {
      continue;
    }
    const [[key, value], ..._setCookieOptions] = setCookie;
    const setCookieOptions = Object.fromEntries(
      _setCookieOptions.map(([k, v]) => [k.toLowerCase(), v])
    );
    const cookieObject: Cookie = {
      name: key,
      value,
      domain: setCookieOptions.domain,
      path: setCookieOptions.path,
      expires: parseNumberOrDate(setCookieOptions.expires),
      sameSite: setCookieOptions.samesite as "Lax" | "Strict" | "None",
      maxAge: parseNumber(setCookieOptions["max-age"]),
      secure: setCookieStr.includes("Secure") ? true : undefined,
      httpOnly: setCookieStr.includes("HttpOnly") ? true : undefined,
    };
    azureCookies.push(cookieObject);
  }
  return azureCookies;
}

export function normalizeAzureFunctionIncomingHeaders(
  request: HttpRequest
): Record<string, string | string[] | undefined> {
  return Object.fromEntries(
    Object.entries(request.headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  );
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
