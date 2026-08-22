//Mariano Montini ('bosque', 'bosquestudio')
import { createHmac } from 'node:crypto'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'
import type { AppEnv } from '../contracts/env.js'
import type { MetaGraphClient } from '../infrastructure/metaGraphClient.js'

// Test env fixture - placeholder credentials for route-level tests.
const testEnv: AppEnv = {
  WHATSAPP_TOKEN: 'tok',
  WHATSAPP_PHONE_NUMBER_ID: 'pnid',
  WHATSAPP_VERIFY_TOKEN: 'verify-me',
  PORT: 3000,
  META_GRAPH_API_VERSION: 'v21.0',
  COUPON_MEDIA_URL: 'https://example.com/coupon.pdf',
}

// Sample inbound body - text coupon keyword for Graph send assertions.
const couponInbound = {
  entry: [
    {
      changes: [
        {
          value: {
            messages: [
              {
                from: '54911',
                id: 'wamid.1',
                type: 'text',
                text: { body: 'coupon' },
              },
            ],
          },
        },
      ],
    },
  ],
}

// Sign body - Meta X-Hub-Signature-256 over exact JSON bytes.
function signBody(raw: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(raw, 'utf8').digest('hex')}`
}

describe('webhook routes', () => {
  // GET verify accept - returns plain-text challenge on matching token.
  it('GET /webhook returns challenge when verify token matches', async () => {
    const app = createApp({
      env: testEnv,
      graphClient: { sendMessage: vi.fn() } as unknown as MetaGraphClient,
    })

    const res = await request(app).get('/webhook').query({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'verify-me',
      'hub.challenge': 'challenge-99',
    })

    expect(res.status).toBe(200)
    expect(res.text).toBe('challenge-99')
  })

  // GET verify reject - 403 when token mismatches.
  it('GET /webhook returns 403 when verify token mismatches', async () => {
    const app = createApp({
      env: testEnv,
      graphClient: { sendMessage: vi.fn() } as unknown as MetaGraphClient,
    })

    const res = await request(app).get('/webhook').query({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'nope',
      'hub.challenge': 'challenge-99',
    })

    expect(res.status).toBe(403)
    expect(res.text).not.toContain('challenge-99')
  })

  // POST inbound - 200 ack and Graph send invoked for text (no secret).
  it('POST /webhook acknowledges and triggers Graph send for text', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: testEnv,
      graphClient: { sendMessage } as unknown as MetaGraphClient,
    })

    const res = await request(app).post('/webhook').send(couponInbound)

    expect(res.status).toBe(200)
    await vi.waitFor(() => {
      expect(sendMessage).toHaveBeenCalled()
    })
    expect(sendMessage.mock.calls[0]?.[0].type).toBe('document')
  })

  // Valid signature - accepted and Graph may be called when secret is set.
  it('POST /webhook accepts valid X-Hub-Signature-256 when app secret is set', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const secret = 'meta-app-secret'
    const raw = JSON.stringify(couponInbound)
    const app = createApp({
      env: { ...testEnv, WHATSAPP_APP_SECRET: secret },
      graphClient: { sendMessage } as unknown as MetaGraphClient,
    })

    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', signBody(raw, secret))
      .send(raw)

    expect(res.status).toBe(200)
    await vi.waitFor(() => {
      expect(sendMessage).toHaveBeenCalled()
    })
  })

  // Missing signature - rejected and Graph not called when secret is set.
  it('POST /webhook rejects missing signature when app secret is set', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: { ...testEnv, WHATSAPP_APP_SECRET: 'meta-app-secret' },
      graphClient: { sendMessage } as unknown as MetaGraphClient,
    })

    const res = await request(app).post('/webhook').send(couponInbound)

    expect([401, 403]).toContain(res.status)
    await new Promise((r) => setTimeout(r, 50))
    expect(sendMessage).not.toHaveBeenCalled()
  })

  // Invalid signature - rejected and Graph not called when secret is set.
  it('POST /webhook rejects invalid signature when app secret is set', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const raw = JSON.stringify(couponInbound)
    const app = createApp({
      env: { ...testEnv, WHATSAPP_APP_SECRET: 'meta-app-secret' },
      graphClient: { sendMessage } as unknown as MetaGraphClient,
    })

    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', signBody(raw, 'wrong-secret'))
      .send(raw)

    expect([401, 403]).toContain(res.status)
    await new Promise((r) => setTimeout(r, 50))
    expect(sendMessage).not.toHaveBeenCalled()
  })
})
