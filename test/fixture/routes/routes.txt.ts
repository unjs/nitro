import type {PrerenderGenerateRoute} from "nitropack";

export default eventHandler(async () => {
  const routes = await useStorage().getItem('cache:prerender:routes') as PrerenderGenerateRoute[]
  return routes.map(route => route.route).join('\n')
});
