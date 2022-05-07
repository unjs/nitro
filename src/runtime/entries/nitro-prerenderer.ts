import '#internal/nitro/virtual/polyfill'
import { nitroApp } from '../app'

export const localFetch = nitroApp.localFetch

process.on('unhandledRejection', err => console.error('[nitro] [dev] [unhandledRejection] ' + err))
process.on('uncaughtException', err => console.error('[nitro] [dev] [uncaughtException] ' + err))
