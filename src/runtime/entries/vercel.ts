import '#internal/nitro/virtual/polyfill'
import { toNodeListener } from 'h3'
import { nitroApp } from '../app'

export default toNodeListener(nitroApp.h3App)
