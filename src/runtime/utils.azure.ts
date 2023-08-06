import type { Cookie } from "@azure/functions";
import { parse } from "cookie-es";
import { splitCookiesString } from "h3";
import { joinHeaders } from "./utils";

export function getAzureParsedCookiesFromHeaders(
  headers: Record<string, number | string | string[] | undefined>
) {
  const c = String(headers["set-cookie"]);
  if (!c || c.length === 0) {
    return [];
  }
  const cookies = splitCookiesString(joinHeaders(c)).map((cookie) =>
    parse(cookie)
  );
  return cookies as unknown as Cookie[];
}
