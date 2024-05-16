import worker from "./base-worker";
import dev from "./nitro-dev";
import prerender from "./nitro-prerender";
import sw from "./service-worker";

export default [...worker, ...dev, ...prerender, ...sw] as const;
