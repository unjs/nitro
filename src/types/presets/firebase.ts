import type { HttpsOptions } from "firebase-functions/v2/https";
import type { RuntimeOptions, region } from "firebase-functions";

export type FirebaseOptions = FirebaseOptionsGen1 | FirebaseOptionsGen2;

export interface FirebaseOptionsBase {
  gen: 1 | 2;
  /**
   * Firebase functions node runtime version.
   * @see https://cloud.google.com/functions/docs/concepts/nodejs-runtime
   */
  nodeVersion?: "20" | "18" | "16";
  /**
   * When deploying multiple apps within the same Firebase project
   * you must give your server a unique name in order to avoid overwriting your functions.
   *
   * @default "server"
   */
  serverFunctionName?: string;
}

export interface FirebaseOptionsGen1 extends FirebaseOptionsBase {
  gen: 1;
  /**
   * Firebase functions 1st generation region passed to `functions.region()`.
   */
  region?: Parameters<typeof region>[0];
  /**
   * Firebase functions 1st generation runtime options passed to `functions.runWith()`.
   */
  runtimeOptions?: RuntimeOptions;
}

export interface FirebaseOptionsGen2 extends FirebaseOptionsBase {
  gen: 2;
  /**
   * Firebase functions 2nd generation https options passed to `onRequest`.
   * @see https://firebase.google.com/docs/reference/functions/2nd-gen/node/firebase-functions.https.httpsoptions
   */
  httpsOptions?: HttpsOptions;
}
