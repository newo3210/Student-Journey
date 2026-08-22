//Mariano Montini ('bosque', 'bosquestudio')
import type { OutboundMessage } from '../contracts/outbound.js'

// Evolution client config - base URL, API key, instance, optional fetch inject.
export type EvolutionClientConfig = {
  baseUrl: string
  apiKey: string
  instance: string
  fetchImpl?: typeof fetch
}

// Send result - HTTP status and parsed Evolution JSON body.
export type EvolutionSendResult = {
  status: number
  body: unknown
}

// Evolution HTTP client - text, buttons, list, media, and presence via v2-style paths.
//
// Pinned path style (Evolution API v2 patterns — isolate churn here):
//   POST {base}/message/sendText/{instance}
//   POST {base}/message/sendButtons/{instance}
//   POST {base}/message/sendList/{instance}
//   POST {base}/message/sendMedia/{instance}
//   POST {base}/chat/sendPresence/{instance}
// Auth header: apikey: <EVOLUTION_API_KEY>
export class EvolutionClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly instance: string
  private readonly fetchImpl: typeof fetch

  // Client constructor - wires credentials and injectable fetch for tests.
  constructor(config: EvolutionClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey
    this.instance = config.instance
    this.fetchImpl = config.fetchImpl ?? fetch
  }

  // Path helper - builds versioned-style REST path under base URL.
  private path(segment: string): string {
    return `${this.baseUrl}${segment}`
  }

  // POST JSON - shared Evolution request with apikey header.
  private async postJson(url: string, body: unknown): Promise<EvolutionSendResult> {
    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        apikey: this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const parsed = await response.json().catch(() => null)
    return { status: response.status, body: parsed }
  }

  // Send presence - composing/recording before humanized outbound.
  async sendPresence(
    to: string,
    presence: 'composing' | 'recording' | 'paused' = 'composing',
  ): Promise<EvolutionSendResult> {
    return this.postJson(this.path(`/chat/sendPresence/${this.instance}`), {
      number: to,
      options: { delay: 0, presence },
    })
  }

  // Send text - Evolution message/sendText.
  async sendText(to: string, text: string): Promise<EvolutionSendResult> {
    return this.postJson(this.path(`/message/sendText/${this.instance}`), {
      number: to,
      text,
    })
  }

  // Send buttons - Evolution message/sendButtons.
  async sendButtons(message: Extract<OutboundMessage, { kind: 'buttons' }>): Promise<EvolutionSendResult> {
    return this.postJson(this.path(`/message/sendButtons/${this.instance}`), {
      number: message.to,
      ...(message.title ? { title: message.title } : {}),
      description: message.description,
      ...(message.footer ? { footer: message.footer } : {}),
      buttons: message.buttons.map((button) => ({
        type: 'reply',
        displayText: button.displayText,
        id: button.id,
      })),
    })
  }

  // Send list - Evolution message/sendList.
  async sendList(message: Extract<OutboundMessage, { kind: 'list' }>): Promise<EvolutionSendResult> {
    return this.postJson(this.path(`/message/sendList/${this.instance}`), {
      number: message.to,
      ...(message.title ? { title: message.title } : {}),
      description: message.description,
      buttonText: message.buttonText,
      ...(message.footer ? { footer: message.footer } : {}),
      sections: message.sections,
    })
  }

  // Send media - Evolution message/sendMedia (image or document).
  async sendMedia(message: Extract<OutboundMessage, { kind: 'media' }>): Promise<EvolutionSendResult> {
    return this.postJson(this.path(`/message/sendMedia/${this.instance}`), {
      number: message.to,
      mediatype: message.mediatype,
      media: message.media,
      ...(message.caption ? { caption: message.caption } : {}),
      ...(message.fileName ? { fileName: message.fileName } : {}),
    })
  }

  // Send outbound message - dispatches by discriminated kind.
  async sendMessage(message: OutboundMessage): Promise<EvolutionSendResult> {
    switch (message.kind) {
      case 'text':
        return this.sendText(message.to, message.text)
      case 'buttons':
        return this.sendButtons(message)
      case 'list':
        return this.sendList(message)
      case 'media':
        return this.sendMedia(message)
      default: {
        const _exhaustive: never = message
        return _exhaustive
      }
    }
  }
}
