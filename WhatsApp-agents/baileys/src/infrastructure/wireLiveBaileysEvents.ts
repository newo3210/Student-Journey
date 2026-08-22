//Mariano Montini ('bosque', 'bosquestudio')
import qrcodeTerminal from 'qrcode-terminal'

// Live event sock - only `ev.on`; tests fake this and never open a real WhatsApp session.
export type LiveBaileysEventSock = {
  ev: {
    on: (event: 'connection.update' | 'messages.upsert', listener: (payload: unknown) => void) => void
  }
}

// Live wiring deps - inbound demo handler plus injectable QR printer.
export type WireLiveBaileysEventsOptions = {
  onInbound: (body: unknown) => unknown
  printQr?: (qr: string) => void
}

// Proto-ish message - Baileys WAMessage fields used for simulator mapping.
type BaileysProtoLike = {
  key?: {
    remoteJid?: string | null
    fromMe?: boolean | null
    id?: string | null
  }
  message?: {
    conversation?: string | null
    extendedTextMessage?: { text?: string | null } | null
  } | null
}

// Print pairing QR - ASCII render plus raw string so a human can scan locally.
export function printBaileysQrToTerminal(qr: string): void {
  console.log('Baileys pairing QR — scan with WhatsApp Linked Devices:')
  qrcodeTerminal.generate(qr, { small: true })
  console.log(`BAILEYS_QR_PAYLOAD:${qr}`)
}

// Map proto message - same `{ event, payload }` shape as extractInboundEvent / HTTP simulator.
export function mapBaileysMessageToWebhookBody(message: unknown): unknown {
  const proto = message as BaileysProtoLike
  const key = proto.key ?? {}
  const conversation = proto.message?.conversation
  const extended = proto.message?.extendedTextMessage?.text
  const body = typeof conversation === 'string' && conversation.length > 0 ? conversation : extended

  return {
    event: 'messages.upsert',
    payload: {
      id: key.id ?? undefined,
      from: key.remoteJid ?? undefined,
      fromMe: key.fromMe === true ? true : key.fromMe === false ? false : undefined,
      body: typeof body === 'string' ? body : undefined,
    },
  }
}

// Wire live events - QR from connection.update; upsert → demo handler (skip fromMe).
export function wireLiveBaileysEvents(
  sock: LiveBaileysEventSock,
  options: WireLiveBaileysEventsOptions,
): void {
  const printQr = options.printQr ?? printBaileysQrToTerminal

  sock.ev.on('connection.update', (update) => {
    const payload = update as { qr?: string; connection?: string }
    if (typeof payload.qr === 'string' && payload.qr.length > 0) {
      printQr(payload.qr)
    }
    if (payload.connection === 'close') {
      console.error('Baileys connection closed')
    }
    if (payload.connection === 'open') {
      console.log('Baileys socket open')
    }
  })

  sock.ev.on('messages.upsert', (upsert) => {
    const bag = upsert as { messages?: unknown[] }
    const messages = Array.isArray(bag.messages) ? bag.messages : []
    for (const message of messages) {
      const proto = message as BaileysProtoLike
      if (proto.key?.fromMe !== false) continue
      const body = mapBaileysMessageToWebhookBody(message)
      void Promise.resolve(options.onInbound(body)).catch((error) => {
        console.error('Live messages.upsert handling failed', error)
      })
    }
  })
}
