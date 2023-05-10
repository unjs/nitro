import { pathToFileURL } from "node:url";
import { resolve, join, relative } from "pathe";
import { joinURL, parseURL, withBase, withoutBase } from "ufo";
import chalk from "chalk";
import { createRouter as createRadixRouter, toRouteMatcher } from "radix3";
import { defu } from "defu";
import { createNitro } from "./nitro";
import { build } from "./build";
import type {
  Nitro,
  NitroRouteRules,
  PrerenderGenerateRoute,
  PrerenderRoute,
} from "./types";
import { writeFile } from "./utils";
import { compressPublicAssets } from "./compress";

const allowedExtensions = new Set(["", ".json"]);

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
  const nitroRenderer = await createNitro({
    ...nitro.options._config,
    rootDir: nitro.options.rootDir,
    logLevel: 0,
    preset: "nitro-prerender",
  });

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
  const skippedRoutes = new Set();
  const displayedLengthWarns = new Set();
  const canPrerender = (route = "/") => {
    // Skip if route is already generated or skipped
    if (generatedRoutes.has(route) || skippedRoutes.has(route)) {
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
      (route.length >= FS_MAX_PATH_PUBLIC_HTML ||
        route.split("/").some((s) => s.length > FS_MAX_SEGMENT)) &&
      !displayedLengthWarns.has(route)
    ) {
      displayedLengthWarns.add(route);
      const _route = route.slice(0, 60) + "...";
      if (route.length >= FS_MAX_PATH_PUBLIC_HTML) {
        nitro.logger.warn(
          `Prerendering long route "${_route}" (${route.length}) can cause filesystem issues since it exceeds ${FS_MAX_PATH_PUBLIC_HTML}-character limit when writing to \`${nitro.options.output.publicDir}\`.`
        );
      } else {
        nitro.logger.warn(
          `Skipping prerender of the route "${_route}" since it exceeds the ${FS_MAX_SEGMENT}-character limit in one of the path segments and can cause filesystem issues.`
        );
        return false;
      }
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

  const generateRoute = async (route: string) => {
    const start = Date.now();

    // Check if we should render route
    if (!canPrerender(route)) {
      skippedRoutes.add(route);
      return;
    }
    generatedRoutes.add(route);

    // Create result object
    const _route: PrerenderGenerateRoute = { route };

    // Fetch the route
    const encodedRoute = encodeURI(route);
    const res = await (localFetch(
      withBase(encodedRoute, nitro.options.baseURL),
      {
        headers: { "x-nitro-prerender": encodedRoute },
      }
    ) as ReturnType<typeof fetch>);
    _route.data = await res.arrayBuffer();
    Object.defineProperty(_route, "contents", {
      get: () => {
        if (!(_route as any)._contents) {
          (_route as any)._contents = new TextDecoder("utf8").decode(
            new Uint8Array(_route.data)
          );
        }
        return (_route as any)._contents;
      },
      set(value: string) {
        (_route as any)._contents = value;
        _route.data = new TextEncoder().encode(value);
      },
    });
    if (res.status !== 200) {
      _route.error = new Error(`[${res.status}] ${res.statusText}`) as any;
      _route.error.statusCode = res.status;
      _route.error.statusMessage = res.statusText;
    }

    // Write to the file
    const isImplicitHTML =
      !route.endsWith(".html") &&
      (res.headers.get("content-type") || "").includes("html");
    const routeWithIndex = route.endsWith("/") ? route + "index" : route;
    _route.fileName = isImplicitHTML
      ? joinURL(route, "index.html")
      : routeWithIndex;
    _route.fileName = withoutBase(_route.fileName, nitro.options.baseURL);

    await nitro.hooks.callHook("prerender:generate", _route, nitro);

    // Measure actual time taken for generating route
    _route.generateTimeMS = Date.now() - start;

    // Check if route skipped or has errors
    if (_route.skip || _route.error) {
      return _route;
    }

    const filePath = join(nitro.options.output.publicDir, _route.fileName);
    await writeFile(filePath, Buffer.from(_route.data));
    nitro._prerenderedRoutes.push(_route);

    // Crawl route links
    if (!_route.error && isImplicitHTML) {
      const extractedLinks = extractLinks(
        _route.contents,
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

    return _route;
  };

  nitro.logger.info(
    nitro.options.prerender.crawlLinks
      ? `Prerendering ${routes.size} initial routes with crawler`
      : `Prerendering ${routes.size} routes`
  );

  async function processRoute(route: string) {
    const _route = await generateRoute(route).catch(
      (error) => ({ route, error } as PrerenderGenerateRoute)
    );

    if (!_route || _route.skip) {
      return;
    }

    await nitro.hooks.callHook("prerender:route", _route);

    if (_route.error) {
      nitro.logger.log(
        chalk[_route.error.statusCode === 404 ? "yellow" : "red"](
          `  ├─ ${_route.route} (${
            _route.generateTimeMS
          }ms) ${`(${_route.error})`}`
        )
      );
    } else {
      nitro.logger.log(
        chalk.gray(`  ├─ ${_route.route} (${_route.generateTimeMS}ms)`)
      );
    }
  }

  await runParallel(routes, processRoute, {
    concurrency: nitro.options.prerender.concurrency,
    interval: nitro.options.prerender.interval,
  });

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
    const task = new Promise((resolve) =>
      setTimeout(resolve, opts.interval)
    ).then(() => cb(route));

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

const LINK_REGEX = /href=["']?([^"'>]+)/g;

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
    const parsed = parseURL(link);
    if (parsed.protocol) {
      continue;
    }
    let { pathname } = parsed;
    if (!pathname.startsWith("/")) {
      const fromURL = new URL(from, "http://localhost");
      pathname = new URL(pathname, fromURL).pathname;
    }
    links.push(pathname);
  }
  return links;
}

const EXT_REGEX = /\.[\da-z]+$/;

function getExtension(link: string): string {
  const pathname = parseURL(link).pathname;
  return (pathname.match(EXT_REGEX) || [])[0] || "";
}
