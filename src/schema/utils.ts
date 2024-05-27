export function provideFallbackValues(obj: Record<string, any>) {
  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null) {
      obj[key] = "";
    } else if (typeof obj[key] === "object") {
      provideFallbackValues(obj[key]);
    }
  }
}
