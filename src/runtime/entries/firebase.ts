import '#polyfill'

// @ts-ignore
import functions from 'firebase-functions'
import { app } from '..'

export const server = functions.https.onRequest(app.nodeHandler)
