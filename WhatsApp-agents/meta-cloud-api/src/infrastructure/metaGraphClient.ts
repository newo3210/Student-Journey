//Mariano Montini ('bosque', 'bosquestudio')
import type { GraphMessagePayload } from '../contracts/outbound.js'

// Graph client config - token, phone number id, API version, optional fetch inject.
export type MetaGraphClientConfig = {
  token: string
  phoneNumberId: string
  apiVersion: string
  fetchImpl?: typeof fetch
  baseUrl?: string
}

// Send result - HTTP status and parsed Graph JSON body.
export type MetaSendResult = {
  status: number
  body: unknown
}

// Meta Graph API client - posts message payloads to Cloud API messages endpoint.
export class MetaGraphClient {
  private readonly token: string
  private readonly phoneNumberId: string
  private readonly apiVersion: string
  private readonly fetchImpl: typeof fetch
  private readonly baseUrl: string

  // Client constructor - wires credentials and injectable fetch for tests.
  constructor(config: MetaGraphClientConfig) {
    this.token = config.token
    this.phoneNumberId = config.phoneNumberId
    this.apiVersion = config.apiVersion
    this.fetchImpl = config.fetchImpl ?? fetch
    this.baseUrl = config.baseUrl ?? 'https://graph.facebook.com'
  }

  // Messages URL - versioned Graph path for the configured phone number id.
  messagesUrl(): string {
    return `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`
  }

  // Send message - POSTs a Graph payload with bearer token authentication.
  async sendMessage(payload: GraphMessagePayload): Promise<MetaSendResult> {
    const response = await this.fetchImpl(this.messagesUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const body = await response.json().catch(() => null)
    return { status: response.status, body }
  }
}
