//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it, vi } from 'vitest'
import { buildMediaMessage, buildTextMessage } from '../services/outboundBuilders.js'
import { BaileysClient, toBaileysJid } from './baileysAdapter.js'

describe('toBaileysJid', () => {
  it('appends @s.whatsapp.net when missing', () => {
    expect(toBaileysJid('54911')).toBe('54911@s.whatsapp.net')
  })
})

describe('BaileysClient', () => {
  it('calls fake sendPresenceUpdate then never opens a real socket', async () => {
    const sendPresenceUpdate = vi.fn(async () => undefined)
    const sendMessage = vi.fn(async () => ({ key: { id: 'out' } }))
    const client = new BaileysClient({ sock: { sendPresenceUpdate, sendMessage } })

    const presence = await client.sendPresence('54911', 'composing')
    expect(sendPresenceUpdate).toHaveBeenCalledWith('composing', '54911@s.whatsapp.net')
    expect(presence.status).toBe(200)
  })

  it('sends text via fake sock.sendMessage', async () => {
    const sendPresenceUpdate = vi.fn(async () => undefined)
    const sendMessage = vi.fn(async () => ({ key: { id: 't1' } }))
    const client = new BaileysClient({ sock: { sendPresenceUpdate, sendMessage } })

    const result = await client.sendMessage(buildTextMessage({ to: '54911', body: 'Hi' }))
    expect(sendMessage).toHaveBeenCalledWith('54911@s.whatsapp.net', { text: 'Hi' })
    expect(result.status).toBe(200)
  })

  it('sends document media via fake sock.sendMessage', async () => {
    const sendMessage = vi.fn(async () => ({ key: { id: 'm1' } }))
    const client = new BaileysClient({
      sock: { sendPresenceUpdate: vi.fn(async () => undefined), sendMessage },
    })

    const result = await client.sendMessage(
      buildMediaMessage({
        to: '54911',
        type: 'document',
        link: 'https://example.com/coupon.pdf',
        caption: 'Coupon',
        filename: 'coupon.pdf',
      }),
    )

    expect(sendMessage).toHaveBeenCalledWith(
      '54911@s.whatsapp.net',
      expect.objectContaining({
        document: { url: 'https://example.com/coupon.pdf' },
        mimetype: 'application/pdf',
        fileName: 'coupon.pdf',
      }),
    )
    expect(result.status).toBe(200)
  })
})
