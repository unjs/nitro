import { builder } from '@netlify/functions'
import { handler as _handler } from '#nitro/entries/aws-lambda'

export const handler = builder(_handler)
