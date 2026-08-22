//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it, vi } from 'vitest'
import { WahaClient } from '../infrastructure/wahaClient.js'
import { handleInboundWebhook } from './inboundHandler.js'
import { buildTextMessage } from './outboundBuilders.js'

describe('WahaClient', () => {
  it('POSTs text to Waha sendText endpoint with X-Api-Key header', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ id: 'out' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const client = new WahaClient({
      baseUrl: 'http://waha.local',
      apiKey: 'secret-key',
      session: 'default',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    const result = await client.sendMessage(buildTextMessage({ to: '54911', body: 'Hi' }))

    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://waha.local/api/sendText')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      'X-Api-Key': 'secret-key',
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(String(init.body))).toMatchObject({
      session: 'default',
      chatId: '54911@c.us',
      text: 'Hi',
    })
    expect(result.status).toBe(201)
  })

  it('POSTs presence to Waha startTyping endpoint', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const client = new WahaClient({
      baseUrl: 'http://waha.local/',
      apiKey: 'k',
      session: 'default',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    await client.sendPresence('54911', 'composing')
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://waha.local/api/startTyping')
    expect(JSON.parse(String(init.body))).toMatchObject({
      session: 'default',
      chatId: '54911@c.us',
    })
  })
})

describe('handleInboundWebhook', () => {
  it('sends humanized outbound reply for inbound text via mocked Waha client', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const sleep = vi.fn(async () => undefined)

    const result = await handleInboundWebhook(
      {
        event: 'message',
        payload: {
          id: 'WAHA.IN',
          from: '5491112345678@c.us',
          fromMe: false,
          body: 'hello',
        },
      },
      {
        wahaClient: { sendPresence, sendMessage } as unknown as WahaClient,
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
        payload: { from: '54911@c.us', id: 'WAHA.OMIT', body: 'hello' },
      },
      {
        wahaClient: { sendPresence: vi.fn(), sendMessage } as unknown as WahaClient,
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
      { event: 'session.status' },
      {
        wahaClient: { sendPresence: vi.fn(), sendMessage } as unknown as WahaClient,
        couponMediaUrl: 'https://example.com/coupon.pdf',
        minDelayMs: 0,
        maxDelayMs: 0,
        sleep: async () => undefined,
      },
    )
    expect(result).toEqual({ handled: false, sent: 0 })
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not count Waha HTTP 500 as a successful send', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 500, body: { error: 'internal' } }))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await handleInboundWebhook(
      {
        event: 'message',
        payload: { from: '54911@c.us', fromMe: false, id: 'WAHA.FAIL', body: 'hello' },
      },
      {
        wahaClient: { sendPresence, sendMessage } as unknown as WahaClient,
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
