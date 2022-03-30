export interface ErrorPayload {
  error: any
  isJsonRequest: boolean
  stack: Array<{ text: string, internal: boolean }>
  errorObject: {
    url?: string
    statusCode: number
    statusMessage: string
    message: string
    description: string
  }
}
