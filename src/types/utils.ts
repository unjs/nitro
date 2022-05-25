export type ConvertRouteToMatcher<Route extends string, Acc extends string = ''> =
Route extends `${infer Segment}:${infer Rest}`
    ? Rest extends `${string}:${string}`
        ? ConvertRouteToMatcher<Rest extends `${string}/${infer NextSeg}`
            ? NextSeg
            : never,
          `${Segment}${string}/`>
        : `${Acc}${Segment}${string}`
    : never

export type NumberOfRouteSegments<Route extends string, Count extends string[] = []> =
Route extends `/${string}/${infer Rest}`
    ? Rest extends `${string}/${string}/${string}`
        ? NumberOfRouteSegments<Rest extends `${string}/${infer NextSeg}` ? `/${NextSeg}`:never, [...Count, '']>
        : Count['length']
    : never
