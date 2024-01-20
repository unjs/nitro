import type { RouterMethod } from "h3";
import type { OperationObject } from "openapi-typescript";


export type NitroOpenapiSchema = {
    routeBase: string,
    method: RouterMethod,
    schema: OperationObject
}