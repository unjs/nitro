import '#internal/nitro/virtual/polyfill'
import { nitroApp } from '../app'

export const handler = nitroApp.h3App.nodeHandler
