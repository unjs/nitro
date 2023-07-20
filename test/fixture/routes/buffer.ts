import { setHeader } from 'h3'

export default defineEventHandler((event) => {
    setHeader(event, 'Content-Type', 'image/png')
    return Buffer.from(base64ToArray(LOGO_BASE64))
})
