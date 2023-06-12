import {
  getQuery,
  type EventHandler,
  type H3Event,
  defineEventHandler,
  readBody
} from 'h3'

interface Actions {
  [key: string]: EventHandler
}

function defineFormActions (actions: Actions) {
  return (event: H3Event) => {
    const action = Object.keys(getQuery(event))[0]
    const handler = action ? actions[action] : Object.values(actions)[0]
    return defineEventHandler(handler(event))
  }
}

function actionResponse(event: H3Event, data: any, action?: any) {
  return { data, action }
}

export default defineFormActions({
  default: async event => {
    const body = await readBody(event)
    return actionResponse(event, { ...body })
  }
})
