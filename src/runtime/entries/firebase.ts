import '#internal/nitro/virtual/polyfill'
// @ts-ignore
import functions from 'firebase-functions'
import { toNodeListener } from 'h3'
import { nitroApp } from '../app'

export const server = functions.https.onRequest(toNodeListener(nitroApp.h3App))
