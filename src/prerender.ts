import { pathToFileURL } from "node:url";
import { resolve, join, relative } from "pathe";
import { joinURL, parseURL, withBase, withoutBase } from "ufo";
import chalk from "chalk";
import { createRouter as createRadixRouter, toRouteMatcher } from "radix3";
import { defu } from "defu";
import mime from "mime";
import { createNitro } from "./nitro";
import { build } from "./build";
import type { Nitro, NitroRouteRules, PrerenderRoute } from "./types";
import { fetchWithRetries, writeFile } from "./utils";
import { compressPublicAssets } from "./compress";

const allowedExtensions = new Set(["", ".json"]);

const linkParents = new Map<string, Set<string>>();

export async function prerender(nitro: Nitro) {
  if (nitro.options.noPublicDir) {
    console.warn(
      "[nitro] Skipping prerender since `noPublicDir` option is enabled."
    );
    return;
  }

  // Initial list of routes to prerender
  const routes = new Set(nitro.options.prerender.routes);

  // Extend with static prerender route rules
  const prerenderRulePaths = Object.entries(nitro.options.routeRules)
    .filter(([path, options]) => options.prerender && !path.includes("*"))
    .map((e) => e[0]);
  for (const route of prerenderRulePaths) {
    routes.add(route);
  }

  // Crawl / at least if no routes are defined
  if (nitro.options.prerender.crawlLinks && routes.size === 0) {
    routes.add("/");
  }

  // Allow extending prereneder routes
  await nitro.hooks.callHook("prerender:routes", routes);

  // Skip if no prerender routes specified
  if (routes.size === 0) {
    return;
  }

  // Build with prerender preset
  nitro.logger.info("Initializing prerenderer");
  nitro._prerenderedRoutes = [];
  nitro._prerenderMeta = nitro._prerenderMeta || {};
  const prerendererConfig = {
    ...nitro.options._config,
    static: false,
    rootDir: nitro.options.rootDir,
    logLevel: 0,
    preset: "nitro-prerender",
  };
  await nitro.hooks.callHook("prerender:config", prerendererConfig);
  const nitroRenderer = await createNitro(prerendererConfig);
  await nitro.hooks.callHook("prerender:init", nitroRenderer);

  // Set path to preview prerendered routes relative to the "host" nitro preset
  let path = relative(nitro.options.output.dir, nitro.options.output.publicDir);
  if (!path.startsWith(".")) {
    path = `./${path}`;
  }
  nitroRenderer.options.commands.preview = `npx serve ${path}`;
  nitroRenderer.options.output.dir = nitro.options.output.dir;

  await build(nitroRenderer);

  // Import renderer entry
  const serverEntrypoint = resolve(
    nitroRenderer.options.output.serverDir,
    "index.mjs"
  );
  const { localFetch } = await import(pathToFileURL(serverEntrypoint).href);

  // Create route rule matcher
  const _routeRulesMatcher = toRouteMatcher(
    createRadixRouter({ routes: nitro.options.routeRules })
  );
  const _getRouteRules = (path: string) =>
    defu({}, ..._routeRulesMatcher.matchAll(path).reverse()) as NitroRouteRules;

  // Start prerendering
  const generatedRoutes = new Set();
  const failedRoutes = new Set<PrerenderRoute>();
  const skippedRoutes = new Set();
  const displayedLengthWarns = new Set();

  const canPrerender = (route = "/") => {
    // Skip if route is already generated or skipped
    if (generatedRoutes.has(route) || skippedRoutes.has(route)) {
      return false;
    }

    // Check for explicitly ignored routes
    for (const ignore of nitro.options.prerender.ignore) {
      if (route.startsWith(ignore)) {
        return false;
      }
    }

    // Check for route rules explicitly disabling prerender
    if (_getRouteRules(route).prerender === false) {
      return false;
    }

    return true;
  };

  const canWriteToDisk = (route: PrerenderRoute) => {
    // Cannot write routes with query
    if (route.route.includes("?")) {
      return false;
    }

    // Ensure length is not too long for filesystem
    // https://en.wikipedia.org/wiki/Comparison_of_file_systems#Limits
    const FS_MAX_SEGMENT = 255;
    // 1024 is the max path length on APFS (undocumented)
    const FS_MAX_PATH = 1024;
    const FS_MAX_PATH_PUBLIC_HTML =
      FS_MAX_PATH - (nitro.options.output.publicDir.length + 10);

    if (
      (route.route.length >= FS_MAX_PATH_PUBLIC_HTML ||
        route.route.split("/").some((s) => s.length > FS_MAX_SEGMENT)) &&
      !displayedLengthWarns.has(route)
    ) {
      displayedLengthWarns.add(route);
      const _route = route.route.slice(0, 60) + "...";
      if (route.route.length >= FS_MAX_PATH_PUBLIC_HTML) {
        nitro.logger.warn(
          `Prerendering long route "${_route}" (${route.route.length}) can cause filesystem issues since it exceeds ${FS_MAX_PATH_PUBLIC_HTML}-character limit when writing to \`${nitro.options.output.publicDir}\`.`
        );
      } else {
        nitro.logger.warn(
          `Skipping prerender of the route "${_route}" since it exceeds the ${FS_MAX_SEGMENT}-character limit in one of the path segments and can cause filesystem issues.`
        );
        return false;
      }
    }

    return true;
  };

  const generateRoute = async (route: string) => {
    const start = Date.now();

    // Check if we should render route
    if (!canPrerender(route)) {
      skippedRoutes.add(route);
      return;
    }
    generatedRoutes.add(route);

    // Create result object
    const _route: PrerenderRoute = { route };

    // Fetch the route
    const encodedRoute = encodeURI(route);

    const res = (await fetchWithRetries({
      url: withBase(encodedRoute, nitro.options.baseURL),
      options: {
        headers: { "x-nitro-prerender": encodedRoute },
      },
      fetcher: localFetch,
      retries: nitro.options.prerender.retries ?? 2, // By default we retry 2 times
      delay: nitro.options.prerender.retryDelay ?? 500,
    })) as Awaited<ReturnType<typeof fetch>>;

    // Data will be removed as soon as written to the disk
    let dataBuff: Buffer | undefined = Buffer.from(await res.arrayBuffer());

    _route.data = await res.arrayBuffer();
    Object.defineProperty(_route, "contents", {
      get: () => {
        return dataBuff ? dataBuff.toString("utf8") : undefined;
      },
      set(value: string) {
        // Only set if we didn't consume the buffer yet
        if (dataBuff) {
          dataBuff = Buffer.from(value);
        }
      },
    });
    Object.defineProperty(_route, "data", {
      get: () => {
        return dataBuff ? dataBuff.buffer : undefined;
      },
      set(value: string) {
        // Only set if we didn't consume the buffer yet
        if (dataBuff) {
          dataBuff = Buffer.from(value);
        }
      },
    });

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
    const redirectCodes = [301, 302, 303, 304, 307, 308];
    if (![200, ...redirectCodes].includes(res.status)) {
      _route.error = new Error(`[${res.status}] ${res.statusText}`) as any;
      _route.error.statusCode = res.status;
      _route.error.statusMessage = res.statusText;
      failedRoutes.add(_route);
    }

    // Measure actual time taken for generating route
    _route.generateTimeMS = Date.now() - start;

    // Guess route type and populate fileName
    const contentType = res.headers.get("content-type") || "";
    const isImplicitHTML =
      !route.endsWith(".html") && contentType.includes("html");
    const routeWithIndex = route.endsWith("/") ? route + "index" : route;
    const htmlPath =
      route.endsWith("/") || nitro.options.prerender.autoSubfolderIndex
        ? joinURL(route, "index.html")
        : route + ".html";
    _route.fileName = withoutBase(
      isImplicitHTML ? htmlPath : routeWithIndex,
      nitro.options.baseURL
    );
    // Allow overriding content-type in `prerender:generate` hook
    const inferredContentType = mime.getType(_route.fileName) || "text/plain";
    _route.contentType = contentType || inferredContentType;

    // Allow hooking before generate
    await nitro.hooks.callHook("prerender:generate", _route, nitro);
    if (_route.contentType !== inferredContentType) {
      nitro._prerenderMeta[_route.fileName] ||= {};
      nitro._prerenderMeta[_route.fileName].contentType = _route.contentType;
    }

    // Check if route is skipped or has errors
    if (_route.skip || _route.error) {
      await nitro.hooks.callHook("prerender:route", _route);
      nitro.logger.log(formatPrerenderRoute(_route));
      dataBuff = undefined; // Free memory
      return _route;
    }

    // Write to the disk
    if (canWriteToDisk(_route)) {
      const filePath = join(nitro.options.output.publicDir, _route.fileName);
      await writeFile(filePath, dataBuff);
      nitro._prerenderedRoutes.push(_route);
    } else {
      _route.skip = true;
    }

    // Crawl route links
    if (!_route.error && isImplicitHTML) {
      const extractedLinks = extractLinks(
        dataBuff.toString("utf8"),
        route,
        res,
        nitro.options.prerender.crawlLinks
      );
      for (const _link of extractedLinks) {
        if (canPrerender(_link)) {
          routes.add(_link);
        }
      }
    }

    await nitro.hooks.callHook("prerender:route", _route);
    nitro.logger.log(formatPrerenderRoute(_route));

    dataBuff = undefined; // Free memory
    return _route;
  };

  nitro.logger.info(
    nitro.options.prerender.crawlLinks
      ? `Prerendering ${routes.size} initial routes with crawler`
      : `Prerendering ${routes.size} routes`
  );

  await runParallel(routes, generateRoute, {
    concurrency: nitro.options.prerender.concurrency,
    interval: nitro.options.prerender.interval,
  });

  await nitro.hooks.callHook("prerender:done", {
    prerenderedRoutes: nitro._prerenderedRoutes,
    failedRoutes: [...failedRoutes],
  });

  if (nitro.options.prerender.failOnError && failedRoutes.size > 0) {
    nitro.logger.log("\nErrors prerendering:");
    for (const route of failedRoutes) {
      const parents = linkParents.get(route.route);
      const parentsText = parents?.size
        ? `\n${[...parents.values()]
            .map((link) => chalk.gray(`  │ └── Linked from ${link}`))
            .join("\n")}`
        : "";
      nitro.logger.log(formatPrerenderRoute(route));
    }
    nitro.logger.log("");
    throw new Error("Exiting due to prerender errors.");
  }

  if (nitro.options.compressPublicAssets) {
    await compressPublicAssets(nitro);
  }
}

async function runParallel<T>(
  inputs: Set<T>,
  cb: (input: T) => unknown | Promise<unknown>,
  opts: { concurrency: number; interval: number }
) {
  const tasks = new Set<Promise<unknown>>();

  function queueNext() {
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

  function refillQueue() {
    const workers = Math.min(opts.concurrency - tasks.size, inputs.size);
    return Promise.all(Array.from({ length: workers }, () => queueNext()));
  }

  await refillQueue();
}

const LINK_REGEX = /(?<=\s)href=(?!&quot;)["']?([^"'>]+)/g;

function extractLinks(
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
        .map((m) => m[1])
        .filter((link) => allowedExtensions.has(getExtension(link)))
    );
  }

  // Extract from x-nitro-prerender headers
  const header = res.headers.get("x-nitro-prerender") || "";
  _links.push(
    ...header
      .split(",")
      .map((i) => i.trim())
      .map((i) => decodeURIComponent(i))
  );

  for (const link of _links.filter(Boolean)) {
    const _link = parseURL(link);
    if (_link.protocol) {
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

function formatPrerenderRoute(route: PrerenderRoute) {
  let str = `  ├─ ${route.route} (${route.generateTimeMS}ms)`;

  if (route.error) {
    const parents = linkParents.get(route.route);
    const errorColor = chalk[route.error.statusCode === 404 ? "yellow" : "red"];
    const errorLead = parents?.size ? "├──" : "└──";
    str += `\n  │ ${errorLead} ${errorColor(route.error)}`;

    if (parents?.size) {
      str += `\n${[...parents.values()]
        .map((link) => `  │ └── Linked from ${link}`)
        .join("\n")}`;
    }
  }

  if (route.skip) {
    str += chalk.gray(" (skipped)");
  }

  return chalk.gray(str);
}
