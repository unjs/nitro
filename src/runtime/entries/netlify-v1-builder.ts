import { builder } from "@netlify/functions";
import { lambda } from "./netlify-v1-lambda";

export const handler = builder(lambda);
