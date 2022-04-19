import '#internal/nitro/virtual/polyfill'
// @ts-ignore
import functions from 'firebase-functions'
import { nitroApp } from '../app'

export const server = functions.https.onRequest(nitroApp.h3App.nodeHandler)
