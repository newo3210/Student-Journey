//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it, vi } from 'vitest'
import { EvolutionClient } from '../infrastructure/evolutionClient.js'
import { handleInboundWebhook } from './inboundHandler.js'
import { buildTextMessage } from './outboundBuilders.js'

describe('EvolutionClient', () => {
  it('POSTs text to Evolution sendText endpoint with apikey header', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ key: { id: 'out' } }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const client = new EvolutionClient({
      baseUrl: 'http://evolution.local',
      apiKey: 'secret-key',
      instance: 'student-demo',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    const result = await client.sendMessage(buildTextMessage({ to: '54911', body: 'Hi' }))

    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://evolution.local/message/sendText/student-demo')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      apikey: 'secret-key',
      'Content-Type': 'application/json',
    })
    expect(result.status).toBe(201)
  })

  it('POSTs presence to Evolution sendPresence endpoint', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const client = new EvolutionClient({
      baseUrl: 'http://evolution.local/',
      apiKey: 'k',
      instance: 'demo',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    await client.sendPresence('54911', 'composing')
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://evolution.local/chat/sendPresence/demo')
    expect(JSON.parse(String(init.body))).toMatchObject({
      number: '54911',
      options: { presence: 'composing' },
    })
  })
})

describe('handleInboundWebhook', () => {
  it('sends humanized outbound reply for inbound text via mocked Evolution client', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const sleep = vi.fn(async () => undefined)

    const result = await handleInboundWebhook(
      {
        event: 'messages.upsert',
        data: {
          key: { remoteJid: '5491112345678@s.whatsapp.net', fromMe: false, id: 'EVO.IN' },
          messageType: 'conversation',
          message: { conversation: 'hello' },
        },
      },
      {
        evolutionClient: { sendPresence, sendMessage } as unknown as EvolutionClient,
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
    expect(sendMessage.mock.calls[0]?.[0].kind).toBe('buttons')
  })

  it('does not send when fromMe is omitted', async () => {
    const sendMessage = vi.fn()
    const result = await handleInboundWebhook(
      {
        event: 'messages.upsert',
        data: {
          key: { remoteJid: '54911@s.whatsapp.net', id: 'EVO.OMIT' },
          messageType: 'conversation',
          message: { conversation: 'hello' },
        },
      },
      {
        evolutionClient: { sendPresence: vi.fn(), sendMessage } as unknown as EvolutionClient,
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
        evolutionClient: { sendPresence: vi.fn(), sendMessage } as unknown as EvolutionClient,
        couponMediaUrl: 'https://example.com/coupon.pdf',
        minDelayMs: 0,
        maxDelayMs: 0,
        sleep: async () => undefined,
      },
    )
    expect(result).toEqual({ handled: false, sent: 0 })
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not count Evolution HTTP 500 as a successful send', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 500, body: { error: 'internal' } }))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await handleInboundWebhook(
      {
        data: {
          key: { remoteJid: '54911@s.whatsapp.net', fromMe: false, id: 'EVO.FAIL' },
          message: { conversation: 'hello' },
          messageType: 'conversation',
        },
      },
      {
        evolutionClient: { sendPresence, sendMessage } as unknown as EvolutionClient,
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
