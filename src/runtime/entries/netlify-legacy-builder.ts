import { builder } from "@netlify/functions";
import { lambda } from "./netlify-legacy-lambda";

export const handler = builder(lambda);
