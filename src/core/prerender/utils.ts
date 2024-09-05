import { colors } from "consola/utils";
import type { PrerenderRoute } from "nitro/types";
import { parseURL } from "ufo";

const allowedExtensions = new Set(["", ".json"]);

const linkParents = new Map<string, Set<string>>();

export async function runParallel<T>(
  inputs: Set<T>,
  cb: (input: T) => unknown | Promise<unknown>,
  opts: { concurrency: number; interval: number }
) {
  const tasks = new Set<Promise<unknown>>();

  function queueNext(): undefined | Promise<unknown> {
    const route = inputs.values().next().value;
    if (!route) {
      return;
    }

    inputs.delete(route);
    const task = new Promise((resolve) => setTimeout(resolve, opts.interval))
      .then(() => cb(route))
      .catch((error) => {
        console.error(error);
      });

    tasks.add(task);
    return task.then(() => {
      tasks.delete(task);
      if (inputs.size > 0) {
        return refillQueue();
      }
    });
  }

  function refillQueue(): Promise<unknown> {
    const workers = Math.min(opts.concurrency - tasks.size, inputs.size);
    return Promise.all(Array.from({ length: workers }, () => queueNext()));
  }

  await refillQueue();
}

const LINK_REGEX = /(?<=\s)href=(?!&quot;)["']?([^"'>]+)/g;

const HTML_ENTITIES = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&apos;": "'",
  "&quot;": '"',
} as Record<string, string>;

function escapeHtml(text: string) {
  return text.replace(
    /&(lt|gt|amp|apos|quot);/g,
    (ch) => HTML_ENTITIES[ch] || ch
  );
}

export function extractLinks(
  html: string,
  from: string,
  res: Response,
  crawlLinks: boolean
) {
  const links: string[] = [];
  const _links: string[] = [];

  // Extract from any <TAG href=""> to crawl
  if (crawlLinks) {
    _links.push(
      ...[...html.matchAll(LINK_REGEX)]
        .map((m) => escapeHtml(m[1]))
        .filter((m) => !decodeURIComponent(m).startsWith("#"))
        .filter((link) => allowedExtensions.has(getExtension(link)))
    );
  }

  // Extract from x-nitro-prerender headers
  const header = res.headers.get("x-nitro-prerender") || "";
  _links.push(...header.split(",").map((i) => decodeURIComponent(i.trim())));

  for (const link of _links.filter(Boolean)) {
    const _link = parseURL(link);
    if (_link.protocol || _link.host) {
      continue;
    }
    if (!_link.pathname.startsWith("/")) {
      const fromURL = new URL(from, "http://localhost");
      _link.pathname = new URL(_link.pathname, fromURL).pathname;
    }
    links.push(_link.pathname + _link.search);
  }
  for (const link of links) {
    const _parents = linkParents.get(link);
    if (_parents) {
      _parents.add(from);
    } else {
      linkParents.set(link, new Set([from]));
    }
  }
  return links;
}

const EXT_REGEX = /\.[\da-z]+$/;

function getExtension(link: string): string {
  const pathname = parseURL(link).pathname;
  return (pathname.match(EXT_REGEX) || [])[0] || "";
}

export function formatPrerenderRoute(route: PrerenderRoute) {
  let str = `  ├─ ${route.route} (${route.generateTimeMS}ms)`;

  if (route.error) {
    const parents = linkParents.get(route.route);
    const errorColor =
      colors[route.error.statusCode === 404 ? "yellow" : "red"];
    const errorLead = parents?.size ? "├──" : "└──";
    str += `\n  │ ${errorLead} ${errorColor(route.error.message)}`;

    if (parents?.size) {
      str += `\n${[...parents.values()]
        .map((link) => `  │ └── Linked from ${link}`)
        .join("\n")}`;
    }
  }

  if (route.skip) {
    str += colors.gray(" (skipped)");
  }

  return colors.gray(str);
}

// prettier-ignore
type IgnorePattern =
  | string
  | RegExp
  | ((path: string) => undefined | null | boolean);
export function matchesIgnorePattern(path: string, pattern: IgnorePattern) {
  if (typeof pattern === "string") {
    // TODO: support radix3 patterns
    return path.startsWith(pattern as string);
  }

  if (typeof pattern === "function") {
    return pattern(path) === true;
  }

  if (pattern instanceof RegExp) {
    return pattern.test(path);
  }

  return false;
}
