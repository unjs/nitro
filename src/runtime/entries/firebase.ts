import '#polyfill'

// @ts-ignore
import functions from 'firebase-functions'
import { handle } from '..'

export const server = functions.https.onRequest(handle)
