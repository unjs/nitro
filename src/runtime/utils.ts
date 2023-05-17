import type { H3Event } from "h3";
import { getRequestHeader } from "h3";
const METHOD_WITH_BODY_RE = /post|put|patch/i;
const TEXT_MIME_RE = /application\/text|text\/html/;
const JSON_MIME_RE = /application\/json/;

export function requestHasBody(request: globalThis.Request): boolean {
  return METHOD_WITH_BODY_RE.test(request.method);
}

export async function useRequestBody(
  request: globalThis.Request
): Promise<any> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("form")) {
    const formData = await request.formData();
    const body = Object.create(null);
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    return body;
  } else if (JSON_MIME_RE.test(contentType)) {
    return request.json();
  } else if (TEXT_MIME_RE.test(contentType)) {
    return request.text();
  } else {
    const blob = await request.blob();
    return URL.createObjectURL(blob);
  }
}

export function hasReqHeader(event: H3Event, name: string, includes: string) {
  const value = getRequestHeader(event, name);
  return (
    value && typeof value === "string" && value.toLowerCase().includes(includes)
  );
}

export function isJsonRequest(event: H3Event) {
  return (
    hasReqHeader(event, "accept", "application/json") ||
    hasReqHeader(event, "user-agent", "curl/") ||
    hasReqHeader(event, "user-agent", "httpie/") ||
    hasReqHeader(event, "sec-fetch-mode", "cors") ||
    event.path.startsWith("/api/") ||
    event.path.endsWith(".json")
  );
}

export function normalizeError(error: any) {
  // temp fix for https://github.com/unjs/nitro/issues/759
  // TODO: investigate vercel-edge not using unenv pollyfill
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = ((error.stack as string) || "")
    .split("\n")
    .splice(1)
    .filter((line) => line.includes("at "))
    .map((line) => {
      const text = line
        .replace(cwd + "/", "./")
        .replace("webpack:/", "")
        .replace("file://", "")
        .trim();
      return {
        text,
        internal:
          (line.includes("node_modules") && !line.includes(".cache")) ||
          line.includes("internal") ||
          line.includes("new Promise"),
      };
    });

  const statusCode = error.statusCode || 500;
  const statusMessage =
    error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();

  return {
    stack,
    statusCode,
    statusMessage,
    message,
  };
}

export function trapUnhandledNodeErrors() {
  if (process.env.DEBUG) {
    process.on("unhandledRejection", (err) =>
      console.error("[nitro] [unhandledRejection]", err)
    );
    process.on("uncaughtException", (err) =>
      console.error("[nitro] [uncaughtException]", err)
    );
  } else {
    process.on("unhandledRejection", (err) =>
      console.error("[nitro] [unhandledRejection] " + err)
    );
    process.on("uncaughtException", (err) =>
      console.error("[nitro]  [uncaughtException] " + err)
    );
  }
}
