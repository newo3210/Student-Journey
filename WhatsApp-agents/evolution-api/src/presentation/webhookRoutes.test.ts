//Mariano Montini ('bosque', 'bosquestudio')
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'
import type { AppEnv } from '../contracts/env.js'
import type { EvolutionClient } from '../infrastructure/evolutionClient.js'

const testEnv: AppEnv = {
  EVOLUTION_API_URL: 'http://evolution.local',
  EVOLUTION_API_KEY: 'key',
  EVOLUTION_INSTANCE: 'student-demo',
  PORT: 3001,
  COUPON_MEDIA_URL: 'https://example.com/coupon.pdf',
  EVOLUTION_API_VERSION: 'v2',
  HUMANIZE_MIN_MS: 0,
  HUMANIZE_MAX_MS: 0,
}

const couponInbound = {
  event: 'messages.upsert',
  data: {
    key: { remoteJid: '54911@s.whatsapp.net', fromMe: false, id: 'EVO.1' },
    messageType: 'conversation',
    message: { conversation: 'coupon' },
  },
}

describe('webhook routes', () => {
  it('GET /health returns ok', async () => {
    const app = createApp({
      env: testEnv,
      evolutionClient: {
        sendPresence: vi.fn(),
        sendMessage: vi.fn(),
      } as unknown as EvolutionClient,
      sleep: async () => undefined,
    })

    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  it('POST /webhook acknowledges and triggers humanized Evolution send for text', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: testEnv,
      evolutionClient: { sendPresence, sendMessage } as unknown as EvolutionClient,
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

  it('accepts matching x-webhook-secret when EVOLUTION_WEBHOOK_SECRET is set', async () => {
    const sendPresence = vi.fn(async () => ({ status: 200, body: {} }))
    const sendMessage = vi.fn(async () => ({ status: 200, body: {} }))
    const app = createApp({
      env: { ...testEnv, EVOLUTION_WEBHOOK_SECRET: 'shared-secret' },
      evolutionClient: { sendPresence, sendMessage } as unknown as EvolutionClient,
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
      env: { ...testEnv, EVOLUTION_WEBHOOK_SECRET: 'shared-secret' },
      evolutionClient: {
        sendPresence: vi.fn(),
        sendMessage,
      } as unknown as EvolutionClient,
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
      env: { ...testEnv, EVOLUTION_WEBHOOK_SECRET: 'shared-secret' },
      evolutionClient: {
        sendPresence: vi.fn(),
        sendMessage,
      } as unknown as EvolutionClient,
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
      evolutionClient: {
        sendPresence: vi.fn(),
        sendMessage,
      } as unknown as EvolutionClient,
      sleep: async () => undefined,
    })

    const res = await request(app)
      .post('/webhook')
      .send({
        event: 'messages.upsert',
        data: {
          key: { remoteJid: '54911@s.whatsapp.net', id: 'EVO.OMIT' },
          messageType: 'conversation',
          message: { conversation: 'coupon' },
        },
      })

    expect(res.status).toBe(200)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(sendMessage).not.toHaveBeenCalled()
  })
})
