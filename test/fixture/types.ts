import { expectTypeOf } from 'expect-type'
import { describe, it } from 'vitest'

interface TestResponse { message: string }

describe('API routes', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dynamicString: string = ''

  it('generates types for middleware, unknown and manual typed routes', () => {
    expectTypeOf($fetch('/')).toMatchTypeOf<Promise<any>>() // middleware
    expectTypeOf($fetch('/api/unknown')).toMatchTypeOf<Promise<unknown>>()
    expectTypeOf($fetch<TestResponse>('/test')).toMatchTypeOf<Promise<TestResponse>>()
  })

  it('generates types for routes with exact matches', () => {
    expectTypeOf($fetch('/api/hello')).toMatchTypeOf<Promise<{ message: string }>>()
    expectTypeOf($fetch('/api/user/john')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/john' }>>()
    expectTypeOf($fetch('/api/user/john/post/coffee')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/john/post/coffee' }>>()
  })

  it('generates types for routes matching params', () => {
    expectTypeOf($fetch('/api/user/{someUserId}')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/:userId' }>>()
    expectTypeOf($fetch('/api/user/{someUserId}/{extends}')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/:userId/:userExtends' }>>()
    expectTypeOf($fetch('/api/user/john/{extends}')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/john/:johnExtends' }>>()
    expectTypeOf($fetch('/api/user/{someUserId}/post/{somePostId}')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/:userId/post/:postId' }>>()
  })

  it('generates types for routes (w/o dynamic template literal) with param and exact matches', () => {
    expectTypeOf($fetch('/api/user/john/post/{somePostId}')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/john/post/:postId' }>>()
    expectTypeOf($fetch('/api/user/{someUserId}/post/firstPost')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/:userId/post/firstPost' }>>()
    expectTypeOf($fetch(`/api/user/${dynamicString}`)).toMatchTypeOf<Promise<
      | { internalApiKey: '/api/user/john' }
      | { internalApiKey: '/api/user/:userId' }
      >>()
    expectTypeOf($fetch(`/api/user/john/post/${dynamicString}`)).toMatchTypeOf<Promise<
      | { internalApiKey: '/api/user/john/post/coffee' }
      | { internalApiKey: '/api/user/john/post/:postId' }
      >>()
    expectTypeOf($fetch(`/api/user/{someUserId}/post/${dynamicString}`)).toMatchTypeOf<Promise<
      | { internalApiKey: '/api/user/:userId/post/:postId' }
      | { internalApiKey: '/api/user/:userId/post/firstPost' }
      >>()
    expectTypeOf($fetch(`/api/user/${dynamicString}/post/${dynamicString}`)).toMatchTypeOf<Promise<
      | { internalApiKey: '/api/user/john/post/coffee' }
      | { internalApiKey: '/api/user/john/post/:postId' }
      | { internalApiKey: '/api/user/:userId/post/:postId' }
      | { internalApiKey: '/api/user/:userId/post/firstPost' }
      >>()
  })

  it('generates types for routes with {matchedRoute}/** glob', () => {
    expectTypeOf($fetch('/api/hey/**')).toMatchTypeOf<Promise<string>>()
    expectTypeOf($fetch('/api/param/{id}/**')).toMatchTypeOf<Promise<any>>()
    expectTypeOf($fetch('/api/user/{someUserId}/post/{somePostId}/**')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/:userId/post/:postId' }>>()
    expectTypeOf($fetch('/api/user/john/post/coffee/**')).toMatchTypeOf<Promise<{ internalApiKey: '/api/user/john/post/coffee' }>>()
    expectTypeOf($fetch(`/api/user/${dynamicString}/post/${dynamicString}/**`)).toMatchTypeOf<Promise<
    | { internalApiKey: '/api/user/john/post/coffee' }
    | { internalApiKey: '/api/user/john/post/:postId' }
    | { internalApiKey: '/api/user/:userId/post/:postId' }
    | { internalApiKey: '/api/user/:userId/post/firstPost' }
    >>()
  })
})
