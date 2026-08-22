//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it, vi } from 'vitest'
import { extractInboundEvent } from '../contracts/webhook.js'
import { handleInboundWebhook } from '../services/inboundHandler.js'
import type { BaileysClient } from './baileysAdapter.js'
import { mapBaileysMessageToWebhookBody, wireLiveBaileysEvents } from './wireLiveBaileysEvents.js'

// Fake event bus - records listeners so tests can fire Baileys events without makeWASocket.
function createFakeSock() {
  const listeners = new Map<string, Array<(payload: unknown) => void>>()

  return {
    ev: {
      on(event: string, listener: (payload: unknown) => void) {
        const list = listeners.get(event) ?? []
        list.push(listener)
        listeners.set(event, list)
      },
    },
    emit(event: string, payload: unknown) {
      for (const listener of listeners.get(event) ?? []) {
        listener(payload)
      }
    },
  }
}

// Sample proto text - inbound user chat (fromMe false) as Baileys WAMessage-like.
function inboundTextMessage(body: string) {
  return {
    key: {
      remoteJid: '5491112345678@s.whatsapp.net',
      fromMe: false,
      id: 'BAILEYS.LIVE1',
    },
    message: {
      conversation: body,
    },
  }
}

describe('mapBaileysMessageToWebhookBody', () => {
  it('maps proto conversation into the same envelope extractInboundEvent accepts', () => {
    const body = mapBaileysMessageToWebhookBody(inboundTextMessage('hello'))
    expect(extractInboundEvent(body)).toEqual({
      from: '5491112345678',
      messageId: 'BAILEYS.LIVE1',
      type: 'text',
      textBody: 'hello',
      interactiveId: undefined,
      interactiveTitle: undefined,
    })
  })

  it('maps extendedTextMessage.text', () => {
    const body = mapBaileysMessageToWebhookBody({
      key: { remoteJid: '54911@s.whatsapp.net', fromMe: false, id: 'EXT1' },
      message: { extendedTextMessage: { text: 'menu' } },
    })
    expect(extractInboundEvent(body)?.textBody).toBe('menu')
  })
})

describe('wireLiveBaileysEvents', () => {
  it('does not import the live socket factory (no makeWASocket in this module under test)', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./wireLiveBaileysEvents.ts', import.meta.url), 'utf8'),
    )
    expect(source).not.toContain("from '@whiskeysockets/baileys'")
    expect(source).not.toContain('createLiveBaileysSocket')
  })

  it('invokes printQr when connection.update includes qr', () => {
    const sock = createFakeSock()
    const printQr = vi.fn()
    const onInbound = vi.fn()

    wireLiveBaileysEvents(sock, { onInbound, printQr })
    sock.emit('connection.update', { qr: 'TESTQR' })

    expect(printQr).toHaveBeenCalledWith('TESTQR')
    expect(printQr).toHaveBeenCalledOnce()
  })

  it('does not call printQr when connection.update has no qr', () => {
    const sock = createFakeSock()
    const printQr = vi.fn()

    wireLiveBaileysEvents(sock, { onInbound: vi.fn(), printQr })
    sock.emit('connection.update', { connection: 'open' })

    expect(printQr).not.toHaveBeenCalled()
  })

  it('maps messages.upsert inbound text into the demo handler path', async () => {
    const sock = createFakeSock()
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const handled: unknown[] = []

    wireLiveBaileysEvents(sock, {
      onInbound: async (body) => {
        handled.push(body)
        await handleInboundWebhook(body, {
          baileysClient: { sendPresence, sendMessage } as unknown as BaileysClient,
          couponMediaUrl: 'https://example.com/coupon.pdf',
          minDelayMs: 0,
          maxDelayMs: 0,
          sleep: async () => undefined,
        })
      },
      printQr: vi.fn(),
    })

    sock.emit('messages.upsert', { messages: [inboundTextMessage('hello')], type: 'notify' })
    await vi.waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())

    expect(extractInboundEvent(handled[0])?.textBody).toBe('hello')
    expect(sendPresence).toHaveBeenCalledOnce()
  })

  it('skips fromMe true upserts without calling onInbound', () => {
    const sock = createFakeSock()
    const onInbound = vi.fn()

    wireLiveBaileysEvents(sock, { onInbound, printQr: vi.fn() })
    sock.emit('messages.upsert', {
      messages: [
        {
          key: { remoteJid: '54911@s.whatsapp.net', fromMe: true, id: 'SELF' },
          message: { conversation: 'echo' },
        },
      ],
      type: 'notify',
    })

    expect(onInbound).not.toHaveBeenCalled()
  })
})
