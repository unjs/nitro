// @ts-ignore
import depA from "nitro-dep-a";
// @ts-ignore
import depB from "nitro-dep-b";
// @ts-ignore
import depLib from "nitro-lib";
// @ts-ignore
import subpathLib from "nitro-lib/subpath";

/*
Structure in fixture/_/node_modules:
| nitrodep-a (1.0.0)
|    nitro-lib (1.0.0)
|       nested-lib (1.0.0)
| nitrodep-b (2.0.1)
|    nitro-lib (2.0.1)
|       nested-lib (2.0.1)
| nitro-lib (2.0.0)
|    nested-lib (2.0.0)
*/

export default defineEventHandler(() => {
  return {
    depA, // expected to all be 1.0.0
    depB, // expected to all be 2.0.1
    depLib, // expected to all be 2.0.0
    subpathLib, // expected to 2.0.0
  };
});
