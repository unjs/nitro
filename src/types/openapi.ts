import type { RouterMethod } from "h3";
import type { OperationObject } from "openapi-typescript";


export interface NitroOpenapiSchema extends OperationObject {
    routeBase: string,
    method: RouterMethod
}