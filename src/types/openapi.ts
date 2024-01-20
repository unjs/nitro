import type { OperationObject } from "openapi-typescript";


export type NitroOpenapiSchema = {
    routeBase: string,
    tags?: string[],
    methods: {
        [key in "get" | "put" | "post" | "delete"]?: OperationObject
    },
}