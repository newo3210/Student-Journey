//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it, vi } from 'vitest'
import type { BaileysClient } from '../infrastructure/baileysAdapter.js'
import { handleInboundWebhook } from './inboundHandler.js'

describe('handleInboundWebhook', () => {
  it('sends humanized outbound reply for inbound text via fake adapter', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const sleep = vi.fn(async () => undefined)

    const result = await handleInboundWebhook(
      {
        event: 'message',
        payload: {
          id: 'BAILEYS.IN',
          from: '5491112345678@s.whatsapp.net',
          fromMe: false,
          body: 'hello',
        },
      },
      {
        baileysClient: { sendPresence, sendMessage } as unknown as BaileysClient,
        couponMediaUrl: 'https://example.com/coupon.pdf',
        minDelayMs: 0,
        maxDelayMs: 0,
        sleep,
      },
    )

    expect(result.handled).toBe(true)
    expect(result.sent).toBe(1)
    expect(sendPresence).toHaveBeenCalledOnce()
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(sendMessage.mock.calls[0]?.[0].to).toBe('5491112345678')
    expect(sendMessage.mock.calls[0]?.[0].kind).toBe('text')
  })

  it('does not send when fromMe is omitted', async () => {
    const sendMessage = vi.fn()
    const result = await handleInboundWebhook(
      {
        event: 'message',
        payload: { from: '54911@s.whatsapp.net', id: 'BAILEYS.OMIT', body: 'hello' },
      },
      {
        baileysClient: { sendPresence: vi.fn(), sendMessage } as unknown as BaileysClient,
        couponMediaUrl: 'https://example.com/coupon.pdf',
        minDelayMs: 0,
        maxDelayMs: 0,
        sleep: async () => undefined,
      },
    )
    expect(result).toEqual({ handled: false, sent: 0 })
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not send when webhook has no inbound message', async () => {
    const sendMessage = vi.fn()
    const result = await handleInboundWebhook(
      { event: 'connection.update' },
      {
        baileysClient: { sendPresence: vi.fn(), sendMessage } as unknown as BaileysClient,
        couponMediaUrl: 'https://example.com/coupon.pdf',
        minDelayMs: 0,
        maxDelayMs: 0,
        sleep: async () => undefined,
      },
    )
    expect(result).toEqual({ handled: false, sent: 0 })
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not count adapter 500 as a successful send', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 500, body: { error: 'internal' } }))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await handleInboundWebhook(
      {
        event: 'message',
        payload: { from: '54911@s.whatsapp.net', fromMe: false, id: 'BAILEYS.FAIL', body: 'hello' },
      },
      {
        baileysClient: { sendPresence, sendMessage } as unknown as BaileysClient,
        couponMediaUrl: 'https://example.com/coupon.pdf',
        minDelayMs: 0,
        maxDelayMs: 0,
        sleep: async () => undefined,
      },
    )

    expect(result.handled).toBe(true)
    expect(result.sent).toBe(0)
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
