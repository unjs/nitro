import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  return `
<h2>API Routes:</h2>
<ul>
<li><a href="/api/hello">/api/hello</a></li>
<li><a href="/api/hello/world">/api/hello/world</a></li>
<li><a href="/api/test">/api/test</a></li>
</ul>
`
})
