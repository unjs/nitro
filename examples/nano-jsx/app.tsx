import { h, renderSSR } from 'nano-jsx'

export default defineEventHandler(() => {
  return renderSSR(() => <div>Hello nano-jsx</div>)
})