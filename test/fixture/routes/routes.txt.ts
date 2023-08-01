import type { PrerenderGenerateRoute } from "nitropack";

export default eventHandler(async (e) => {
  const routes = await useStorage().getItem('cache:prerender:routes') as PrerenderGenerateRoute[]
  setHeader(e, 'content-type', 'text/plain; charset=utf-8')
  return ['Routes:', ...routes.map(route => route.route)].join('\n')
});
