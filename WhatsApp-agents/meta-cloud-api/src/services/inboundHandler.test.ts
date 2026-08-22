//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it, vi } from 'vitest'
import { MetaGraphClient } from '../infrastructure/metaGraphClient.js'
import { handleInboundWebhook } from '../services/inboundHandler.js'
import { buildTextPayload } from '../services/outboundBuilders.js'

describe('MetaGraphClient', () => {
  // Send message - posts to versioned messages URL with bearer token.
  it('POSTs payload to Graph messages endpoint with auth header', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ messages: [{ id: 'wamid.OUT' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const client = new MetaGraphClient({
      token: 'tok',
      phoneNumberId: 'pnid',
      apiVersion: 'v21.0',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })

    const payload = buildTextPayload({ to: '54911', body: 'Hi' })
    const result = await client.sendMessage(payload)

    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://graph.facebook.com/v21.0/pnid/messages')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer tok',
      'Content-Type': 'application/json',
    })
    expect(result.status).toBe(200)
  })
})

describe('handleInboundWebhook', () => {
  // Text inbound → outbound - service sends a reply through mocked Graph client.
  it('sends outbound reply for inbound text via mocked Graph client', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const graphClient = { sendMessage } as unknown as MetaGraphClient

    const body = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '5491112345678',
                    id: 'wamid.IN',
                    type: 'text',
                    text: { body: 'hello' },
                  },
                ],
              },
            },
          ],
        },
      ],
    }

    const result = await handleInboundWebhook(body, {
      graphClient,
      couponMediaUrl: 'https://example.com/coupon.pdf',
    })

    expect(result.handled).toBe(true)
    expect(result.sent).toBe(1)
    expect(sendMessage).toHaveBeenCalledOnce()
    const sentPayload = sendMessage.mock.calls[0]?.[0]
    expect(sentPayload.to).toBe('5491112345678')
    expect(sentPayload.type).toBe('interactive')
  })

  // Status-only webhook - nothing sent.
  it('does not send when webhook has no inbound message', async () => {
    const sendMessage = vi.fn()
    const graphClient = { sendMessage } as unknown as MetaGraphClient
    const result = await handleInboundWebhook({ entry: [] }, {
      graphClient,
      couponMediaUrl: 'https://example.com/coupon.pdf',
    })
    expect(result).toEqual({ handled: false, sent: 0 })
    expect(sendMessage).not.toHaveBeenCalled()
  })

  // Graph HTTP 500 - failure is not counted toward successful `sent`.
  it('does not count Graph HTTP 500 as a successful send', async () => {
    const sendMessage = vi.fn(async () => ({ status: 500, body: { error: 'internal' } }))
    const graphClient = { sendMessage } as unknown as MetaGraphClient
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const body = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '5491112345678',
                    id: 'wamid.FAIL',
                    type: 'text',
                    text: { body: 'hello' },
                  },
                ],
              },
            },
          ],
        },
      ],
    }

    const result = await handleInboundWebhook(body, {
      graphClient,
      couponMediaUrl: 'https://example.com/coupon.pdf',
    })

    expect(result.handled).toBe(true)
    expect(result.sent).toBe(0)
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
