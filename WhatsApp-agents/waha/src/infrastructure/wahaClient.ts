//Mariano Montini ('bosque', 'bosquestudio')
import type { OutboundMessage } from '../contracts/outbound.js'

// Waha client config - base URL, API key, session, optional fetch inject.
export type WahaClientConfig = {
  baseUrl: string
  apiKey: string
  session: string
  fetchImpl?: typeof fetch
}

// Send result - HTTP status and parsed Waha JSON body.
export type WahaSendResult = {
  status: number
  body: unknown
}

// ChatId helper - Waha send APIs expect phone@c.us.
export function toWahaChatId(to: string): string {
  if (to.includes('@')) return to
  return `${to}@c.us`
}

// Waha HTTP client - text, buttons, list, media, and typing via pinned REST paths.
//
// Pinned path style (Waha CORE/PLUS docs — isolate churn here):
//   POST {base}/api/sendText
//   POST {base}/api/sendButtons          (deprecated on CORE; PLUS/WEBJS may differ)
//   POST {base}/api/sendList             (GOWS / NOWEB PLUS; not CORE)
//   POST {base}/api/sendFile             (document)
//   POST {base}/api/sendImage            (image)
//   POST {base}/api/startTyping          (presence equivalent)
// Auth header: X-Api-Key: <WAHA_API_KEY>
export class WahaClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly session: string
  private readonly fetchImpl: typeof fetch

  // Client constructor - wires credentials and injectable fetch for tests.
  constructor(config: WahaClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.apiKey = config.apiKey
    this.session = config.session
    this.fetchImpl = config.fetchImpl ?? fetch
  }

  // Path helper - builds Waha REST path under base URL.
  private path(segment: string): string {
    return `${this.baseUrl}${segment}`
  }

  // POST JSON - shared Waha request with X-Api-Key header.
  private async postJson(url: string, body: unknown): Promise<WahaSendResult> {
    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const parsed = await response.json().catch(() => null)
    return { status: response.status, body: parsed }
  }

  // Send presence - startTyping before humanized outbound.
  async sendPresence(to: string, _presence: 'composing' | 'recording' | 'paused' = 'composing'): Promise<WahaSendResult> {
    return this.postJson(this.path('/api/startTyping'), {
      session: this.session,
      chatId: toWahaChatId(to),
    })
  }

  // Send text - Waha /api/sendText.
  async sendText(to: string, text: string): Promise<WahaSendResult> {
    return this.postJson(this.path('/api/sendText'), {
      session: this.session,
      chatId: toWahaChatId(to),
      text,
    })
  }

  // Send buttons - Waha /api/sendButtons (fragile / deprecated; isolated here).
  async sendButtons(message: Extract<OutboundMessage, { kind: 'buttons' }>): Promise<WahaSendResult> {
    return this.postJson(this.path('/api/sendButtons'), {
      session: this.session,
      chatId: toWahaChatId(message.to),
      ...(message.title ? { header: message.title } : {}),
      body: message.description,
      ...(message.footer ? { footer: message.footer } : {}),
      buttons: message.buttons.map((button) => ({
        type: 'reply',
        text: button.displayText,
        id: button.id,
      })),
    })
  }

  // Send list - Waha /api/sendList (PLUS GOWS/NOWEB).
  async sendList(message: Extract<OutboundMessage, { kind: 'list' }>): Promise<WahaSendResult> {
    return this.postJson(this.path('/api/sendList'), {
      session: this.session,
      chatId: toWahaChatId(message.to),
      message: {
        ...(message.title ? { title: message.title } : {}),
        description: message.description,
        button: message.buttonText,
        ...(message.footer ? { footer: message.footer } : {}),
        sections: message.sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row) => ({
            title: row.title,
            rowId: row.id,
            ...(row.description ? { description: row.description } : {}),
          })),
        })),
      },
    })
  }

  // Send media - Waha sendFile (document) or sendImage.
  async sendMedia(message: Extract<OutboundMessage, { kind: 'media' }>): Promise<WahaSendResult> {
    const chatId = toWahaChatId(message.to)
    if (message.mediatype === 'image') {
      return this.postJson(this.path('/api/sendImage'), {
        session: this.session,
        chatId,
        caption: message.caption,
        file: {
          mimetype: 'image/jpeg',
          filename: message.fileName ?? 'coupon.jpg',
          url: message.media,
        },
      })
    }

    return this.postJson(this.path('/api/sendFile'), {
      session: this.session,
      chatId,
      caption: message.caption,
      file: {
        mimetype: 'application/pdf',
        filename: message.fileName ?? 'coupon.pdf',
        url: message.media,
      },
    })
  }

  // Send outbound message - dispatches by discriminated kind.
  async sendMessage(message: OutboundMessage): Promise<WahaSendResult> {
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
