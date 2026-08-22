//Mariano Montini ('bosque', 'bosquestudio')
import type { OutboundMessage } from '../contracts/outbound.js'

// Socket presence types - Baileys sendPresenceUpdate first argument.
export type BaileysPresence = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'

// Injectable socket - subset used by the adapter (tests provide a fake, never a live WA socket).
export type BaileysSocketLike = {
  sendPresenceUpdate: (type: BaileysPresence, toJid?: string) => Promise<void>
  sendMessage: (jid: string, content: Record<string, unknown>) => Promise<unknown>
}

// Adapter config - injectable socket (required in tests; live sock from createLiveSocket).
export type BaileysAdapterConfig = {
  sock: BaileysSocketLike
}

// Send result - HTTP-like status so humanized dispatch can count 2xx vs failures.
export type BaileysSendResult = {
  status: number
  body: unknown
}

// ChatId helper - Baileys user chats typically use phone@s.whatsapp.net.
export function toBaileysJid(to: string): string {
  if (to.includes('@')) return to
  return `${to}@s.whatsapp.net`
}

// Baileys client adapter - presence + send text/media via socket methods (no REST gateway).
export class BaileysClient {
  private readonly sock: BaileysSocketLike

  // Client constructor - wires injectable socket (fake in tests; live only from index).
  constructor(config: BaileysAdapterConfig) {
    this.sock = config.sock
  }

  // Send presence - Baileys sendPresenceUpdate('composing', jid) before humanized outbound.
  async sendPresence(to: string, presence: BaileysPresence = 'composing'): Promise<BaileysSendResult> {
    try {
      await this.sock.sendPresenceUpdate(presence, toBaileysJid(to))
      return { status: 200, body: { ok: true } }
    } catch (error) {
      return { status: 500, body: { error: String(error) } }
    }
  }

  // Send text - sock.sendMessage with { text }.
  async sendText(to: string, text: string): Promise<BaileysSendResult> {
    try {
      const body = await this.sock.sendMessage(toBaileysJid(to), { text })
      return { status: 200, body }
    } catch (error) {
      return { status: 500, body: { error: String(error) } }
    }
  }

  // Send buttons - maps to a text fallback (native buttons documented as unstable).
  async sendButtons(message: Extract<OutboundMessage, { kind: 'buttons' }>): Promise<BaileysSendResult> {
    const lines = message.buttons.map((button, index) => `${index + 1}) ${button.displayText}`).join('\n')
    const text = [message.title, message.description, lines, message.footer].filter(Boolean).join('\n')
    return this.sendText(message.to, text)
  }

  // Send list - maps to numbered text (native lists documented as unstable).
  async sendList(message: Extract<OutboundMessage, { kind: 'list' }>): Promise<BaileysSendResult> {
    const rows = message.sections.flatMap((section) =>
      section.rows.map((row, index) => `${index + 1}) ${row.title}`),
    )
    const text = [message.title, message.description, rows.join('\n'), message.footer].filter(Boolean).join('\n')
    return this.sendText(message.to, text)
  }

  // Send media - document or image via URL content (Baileys message content object).
  async sendMedia(message: Extract<OutboundMessage, { kind: 'media' }>): Promise<BaileysSendResult> {
    const jid = toBaileysJid(message.to)
    const content =
      message.mediatype === 'image'
        ? {
            image: { url: message.media },
            caption: message.caption,
          }
        : {
            document: { url: message.media },
            mimetype: 'application/pdf',
            fileName: message.fileName ?? 'coupon.pdf',
            caption: message.caption,
          }

    try {
      const body = await this.sock.sendMessage(jid, content)
      return { status: 200, body }
    } catch (error) {
      return { status: 500, body: { error: String(error) } }
    }
  }

  // Send outbound message - dispatches by discriminated kind.
  async sendMessage(message: OutboundMessage): Promise<BaileysSendResult> {
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
