import { eventHandler } from 'h3'

export default eventHandler(event => `Hello ${event.params.name}!`)
