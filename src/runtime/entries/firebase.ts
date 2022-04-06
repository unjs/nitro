import '#polyfill'

// @ts-ignore
import functions from 'firebase-functions'
import { app } from '../app'

export const server = functions.https.onRequest(app.nodeHandler)
