import { expectTypeOf } from "expect-type";
import { describe, it } from "vitest";
import type { FetchResponse } from "ofetch"
import type { $Fetch } from "../..";
import { defineNitroConfig } from "../../src/config";

interface TestResponse {
  message: string;
}

const $fetch = {} as $Fetch;

describe("API routes", () => {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  const dynamicString: string = "";

  it("requires correct options for typed routes", async () => {
    // @ts-expect-error should be a POST request
    await $fetch("/api/upload");
    // TODO: @ts-expect-error `query.id` is required
    await $fetch("/typed-routes");
    // @ts-expect-error `query.id` is required
    await $fetch("/typed-routes", {});
    // @ts-expect-error `query.id` should be a string
    await $fetch("/typed-routes", { query: { id: 42 } });

    expectTypeOf($fetch("/typed-routes", { query: { id: 'string' } })).toEqualTypeOf<Promise<string>>();
  });

  it("generates types for unknown and manual typed routes", () => {
    // @ts-expect-error No route matching this path exists
    $fetch("/");
    $fetch("https://test.com/");
    expectTypeOf($fetch("/api/unknown")).toEqualTypeOf<Promise<unknown>>();
    expectTypeOf($fetch<TestResponse>("/test")).toEqualTypeOf<
      Promise<TestResponse>
    >();
  });

  it("generates types for routes with exact matches", () => {
    expectTypeOf($fetch("/api/hello")).toEqualTypeOf<
      Promise<{ message: string }>
    >();
    expectTypeOf($fetch("/api/typed/user/john")).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/john" }>
    >();
    expectTypeOf($fetch("/api/typed/user/john/post/coffee")).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/john/post/coffee" }>
    >();
  });

  it("generates types for routes matching params", () => {
    expectTypeOf($fetch("/api/typed/user/{someUserId}")).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/:userId" }>
    >();
    expectTypeOf(
      $fetch("/api/typed/user/{someUserId}/{extends}")
    ).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/:userId/:userExtends" }>
    >();
    expectTypeOf($fetch("/api/typed/user/john/{extends}")).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/john/:johnExtends" }>
    >();
    expectTypeOf(
      $fetch("/api/typed/user/{someUserId}/post/{somePostId}")
    ).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/:userId/post/:postId" }>
    >();
  });

  it("generates types for routes (w/o dynamic template literal) and with param and exact matches", () => {
    expectTypeOf(
      $fetch("/api/typed/user/john/post/{somePostId}")
    ).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/john/post/:postId" }>
    >();
    expectTypeOf(
      $fetch(`/api/typed/user/${dynamicString}/post/firstPost`)
    ).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/:userId/post/firstPost" }>
    >();
    expectTypeOf($fetch(`/api/typed/user/${dynamicString}`)).toEqualTypeOf<
      Promise<
        // TODO: reenable deep merging of return types
      // | { internalApiKey: "/api/typed/user/john" }
        | { internalApiKey: "/api/typed/user/:userId" }
      >
    >();
    expectTypeOf(
      $fetch(`/api/typed/user/john/post/${dynamicString}`)
    ).toEqualTypeOf<
      Promise<
        // TODO: reenable deep merging of return types
      // | { internalApiKey: "/api/typed/user/john/post/coffee" }
        | { internalApiKey: "/api/typed/user/john/post/:postId" }
      >
    >();
    expectTypeOf(
      $fetch(`/api/typed/user/{someUserId}/post/${dynamicString}`)
    ).toEqualTypeOf<
      Promise<
        | { internalApiKey: "/api/typed/user/:userId/post/:postId" }
        // TODO: reenable deep merging of return types
        // | { internalApiKey: "/api/typed/user/:userId/post/firstPost" }
      >
    >();
    expectTypeOf(
      $fetch(`/api/typed/user/${dynamicString}/post/${dynamicString}`)
    ).toEqualTypeOf<
      Promise<
        // TODO: reenable deep merging of return types
        // | { internalApiKey: "/api/typed/user/john/post/coffee" }
        // | { internalApiKey: "/api/typed/user/john/post/:postId" }
        | { internalApiKey: "/api/typed/user/:userId/post/:postId" }
        // | { internalApiKey: "/api/typed/user/:userId/post/firstPost" }
      >
    >();
  });

  it("generates types for routes matching prefix", () => {
    expectTypeOf($fetch("/api/param/{id}/**")).toEqualTypeOf<Promise<string>>();
    expectTypeOf(
      $fetch("/api/typed/user/{someUserId}/post/{somePostId}/**")
    ).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/user/:userId/post/:postId" }>
    >();
    expectTypeOf(
      $fetch(`/api/typed/user/${dynamicString}/post/${dynamicString}/**`)
    ).toEqualTypeOf<
      Promise<
        // TODO: reenable deep merging of return types
        // | { internalApiKey: "/api/typed/user/john/post/coffee" }
        // | { internalApiKey: "/api/typed/user/john/post/:postId" }
        | { internalApiKey: "/api/typed/user/:userId/post/:postId" }
        // | { internalApiKey: "/api/typed/user/:userId/post/firstPost" }
      >
    >();
  });

  it("ignores query suffixes", () => {
    expectTypeOf($fetch("/api/hey?test=true")).toEqualTypeOf<Promise<string>>();
    expectTypeOf($fetch("/api/hello?")).toEqualTypeOf<
      Promise<{ message: string }>
    >();
  });

  it("generates types for routes matching Api keys with /** globs", () => {
    expectTypeOf($fetch("/api/wildcard/foo/bar")).toEqualTypeOf<
      Promise<string>
    >();
    expectTypeOf($fetch("/api/typed/todos/parent/child")).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/todos/**" }>
    >();
    expectTypeOf(
      $fetch(`/api/typed/todos/${dynamicString}/child`)
    ).toEqualTypeOf<Promise<{ internalApiKey: "/api/typed/todos/**" }>>();
    expectTypeOf(
      $fetch(`/api/typed/todos/some/deeply/nest/${dynamicString}/path`)
    ).toEqualTypeOf<Promise<{ internalApiKey: "/api/typed/todos/**" }>>();
    expectTypeOf(
      $fetch("/api/typed/todos/firstTodo/comments/foo")
    ).toEqualTypeOf<
      Promise<
        { internalApiKey: "/api/typed/todos/:todoId/comments/**:commentId" }
      >
    >();
    expectTypeOf(
      $fetch(`/api/typed/todos/firstTodo/comments/${dynamicString}`)
    ).toEqualTypeOf<
      Promise<
        { internalApiKey: "/api/typed/todos/:todoId/comments/**:commentId" }
      >
    >();
    expectTypeOf(
      $fetch(`/api/typed/todos/${dynamicString}/${dynamicString}/foo/bar/baz`)
    ).toEqualTypeOf<
      Promise<
        | { internalApiKey: "/api/typed/todos/**" }
        // TODO: reenable deep merging of return types
        // | { internalApiKey: "/api/typed/todos/:todoId/comments/**:commentId" }
      >
    >();
    expectTypeOf(
      $fetch(`/api/typed/catchall/${dynamicString}/foo/bar/baz`)
    ).toEqualTypeOf<
      Promise<
        | { internalApiKey: "/api/typed/catchall/:slug/**:another" }
        // TODO: reenable deep merging of return types
        // | { internalApiKey: "/api/typed/catchall/some/**:test" }
      >
    >();
    expectTypeOf($fetch("/api/typed/catchall/some/foo/bar/baz")).toEqualTypeOf<
      Promise<{ internalApiKey: "/api/typed/catchall/some/**:test" }>
    >();
  });

  it("generates the correct type depending on the method used", () => {
    expectTypeOf($fetch("/api/methods", { method: "get" })).toEqualTypeOf<
      Promise<"Index get">
    >();
    expectTypeOf($fetch("/api/methods", { method: "post" })).toEqualTypeOf<
      Promise<"Index post">
    >();
    expectTypeOf(
      $fetch("/api/methods/default", { method: "GET" })
    ).toEqualTypeOf<Promise<"Default route">>();
    expectTypeOf(
      $fetch("/api/methods/default", { method: "PUT" })
    ).toEqualTypeOf<Promise<"Default route">>();
    expectTypeOf(
      $fetch("/api/methods/default", { method: "POST" })
    ).toEqualTypeOf<Promise<"Default override">>();
  });

  it("generates types matching JSON serialization output", () => {
    expectTypeOf($fetch("/api/serialized/date")).toEqualTypeOf<
      Promise<{
        createdAt: string;
      }>
    >();

    expectTypeOf($fetch("/api/serialized/error")).toEqualTypeOf<
      Promise<{
        statusCode: number;
        statusMessage?: string;
        data?: any;
        message: string;
      }>
    >();

    expectTypeOf($fetch("/api/serialized/void")).toEqualTypeOf<
      Promise<never>
    >();

    expectTypeOf($fetch("/api/serialized/null")).toEqualTypeOf<Promise<any>>();

    expectTypeOf($fetch("/api/serialized/function")).toEqualTypeOf<
      // eslint-disable-next-line @typescript-eslint/ban-types
      Promise<{}>
    >();

    expectTypeOf($fetch("/api/serialized/map")).toEqualTypeOf<
      Promise<{
        foo: Record<string, never>;
      }>
    >();

    expectTypeOf($fetch("/api/serialized/set")).toEqualTypeOf<
      Promise<{
        foo: Record<string, never>;
      }>
    >();

    expectTypeOf($fetch("/api/serialized/tuple")).toEqualTypeOf<
      Promise<[string, string]>
    >();
  });

  it('types event.$fetch', () => {
    const event = useEvent();
    expectTypeOf(event.$fetch("/api/serialized/tuple")).toEqualTypeOf<
      Promise<[string, string]>
    >();
  })

  it('produces correct $fetch.raw', async () => {
    const r = await $fetch.raw("/api/serialized/tuple")
    expectTypeOf($fetch.raw("/api/serialized/tuple")).toEqualTypeOf<
      Promise<FetchResponse<[string, string]>>
    >();
  })

  it('produces correctly typed new instance with $fetch.create', () => {
    const newBase = $fetch.create({
      baseURL: 'https://test.com'
    })
    expectTypeOf(newBase("/api/serialized/tuple")).toEqualTypeOf<Promise<unknown>>();
    const sameBase = $fetch.create({
      headers: { Authorization: 'Bearer 123' }
    })
    expectTypeOf(sameBase("/api/serialized/tuple")).toEqualTypeOf<
      Promise<[string, string]>
    >();
  })
});

describe("defineNitroConfig", () => {
  it("should not accept functions to routeRules.cache", () => {
    defineNitroConfig({
      routeRules: {
        "/**": {
          cache: {
            // @ts-expect-error
            shouldBypassCache(event) {
              return false;
            },
          },
        },
      },
    });
  });
});
