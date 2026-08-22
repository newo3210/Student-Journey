//Mariano Montini ('bosque', 'bosquestudio')
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'
import type { AppEnv } from '../contracts/env.js'
import type { WahaClient } from '../infrastructure/wahaClient.js'

const testEnv: AppEnv = {
  WAHA_API_URL: 'http://waha.local',
  WAHA_API_KEY: 'key',
  WAHA_SESSION: 'default',
  PORT: 3002,
  COUPON_MEDIA_URL: 'https://example.com/coupon.pdf',
  WAHA_MENU_MODE: 'text',
  HUMANIZE_MIN_MS: 0,
  HUMANIZE_MAX_MS: 0,
}

const couponInbound = {
  event: 'message',
  payload: {
    id: 'WAHA.1',
    from: '54911@c.us',
    fromMe: false,
    body: 'coupon',
  },
}

describe('webhook routes', () => {
  it('GET /health returns ok', async () => {
    const app = createApp({
      env: testEnv,
      wahaClient: {
        sendPresence: vi.fn(),
        sendMessage: vi.fn(),
      } as unknown as WahaClient,
      sleep: async () => undefined,
    })

    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  it('POST /webhook acknowledges and triggers humanized Waha send for text', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: testEnv,
      wahaClient: { sendPresence, sendMessage } as unknown as WahaClient,
      sleep: async () => undefined,
    })

    const res = await request(app).post('/webhook').send(couponInbound)

    expect(res.status).toBe(200)
    await vi.waitFor(() => {
      expect(sendPresence).toHaveBeenCalled()
      expect(sendMessage).toHaveBeenCalled()
    })
    expect(sendMessage.mock.calls[0]?.[0].kind).toBe('media')
  })

  it('accepts matching x-webhook-secret when WAHA_WEBHOOK_SECRET is set', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: { ...testEnv, WAHA_WEBHOOK_SECRET: 'shared-secret' },
      wahaClient: { sendPresence, sendMessage } as unknown as WahaClient,
      sleep: async () => undefined,
    })

    const res = await request(app)
      .post('/webhook')
      .set('x-webhook-secret', 'shared-secret')
      .send(couponInbound)

    expect(res.status).toBe(200)
    await vi.waitFor(() => {
      expect(sendMessage).toHaveBeenCalled()
    })
  })

  it('rejects missing x-webhook-secret with 401 and does not send', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: { ...testEnv, WAHA_WEBHOOK_SECRET: 'shared-secret' },
      wahaClient: {
        sendPresence: vi.fn(),
        sendMessage,
      } as unknown as WahaClient,
      sleep: async () => undefined,
    })

    const res = await request(app).post('/webhook').send(couponInbound)

    expect(res.status).toBe(401)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('rejects mismatched x-webhook-secret with 403 and does not send', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: { ...testEnv, WAHA_WEBHOOK_SECRET: 'shared-secret' },
      wahaClient: {
        sendPresence: vi.fn(),
        sendMessage,
      } as unknown as WahaClient,
      sleep: async () => undefined,
    })

    const res = await request(app)
      .post('/webhook')
      .set('x-webhook-secret', 'wrong')
      .send(couponInbound)

    expect([401, 403]).toContain(res.status)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not send when fromMe is omitted on an otherwise valid payload', async () => {
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: testEnv,
      wahaClient: {
        sendPresence: vi.fn(),
        sendMessage,
      } as unknown as WahaClient,
      sleep: async () => undefined,
    })

    const res = await request(app)
      .post('/webhook')
      .send({
        event: 'message',
        payload: { from: '54911@c.us', id: 'WAHA.OMIT', body: 'coupon' },
      })

    expect(res.status).toBe(200)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(sendMessage).not.toHaveBeenCalled()
  })
})
