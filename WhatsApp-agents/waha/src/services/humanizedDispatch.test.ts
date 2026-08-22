//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it, vi } from 'vitest'
import type { WahaClient } from '../infrastructure/wahaClient.js'
import { humanizedDispatch, pickDelayMs } from './humanizedDispatch.js'
import { buildTextMessage } from './outboundBuilders.js'

describe('pickDelayMs', () => {
  it('returns value within inclusive min/max range', () => {
    expect(pickDelayMs(20_000, 45_000, () => 0)).toBe(20_000)
    expect(pickDelayMs(20_000, 45_000, () => 0.999999)).toBe(45_000)
  })

  it('returns min when max equals min', () => {
    expect(pickDelayMs(0, 0)).toBe(0)
  })
})

describe('humanizedDispatch', () => {
  it('calls presence, then sleep, then send (no wall-clock wait)', async () => {
    const order: string[] = []
    const sendPresence = vi.fn(async () => {
      order.push('presence')
      return { status: 200, body: {} }
    })
    const sendMessage = vi.fn(async () => {
      order.push('send')
      return { status: 200, body: { id: 'out' } }
    })
    const sleep = vi.fn(async (ms: number) => {
      order.push(`sleep:${ms}`)
    })

    const result = await humanizedDispatch(buildTextMessage({ to: '54911', body: 'Hi' }), {
      client: { sendPresence, sendMessage } as unknown as WahaClient,
      minDelayMs: 100,
      maxDelayMs: 100,
      sleep,
      random: () => 0,
    })

    expect(order).toEqual(['presence', 'sleep:100', 'send'])
    expect(sendPresence).toHaveBeenCalledWith('54911', 'composing')
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(result.sendStatus).toBe(200)
    expect(result.delayMs).toBe(100)
  })

  it('supports zero delay override for fast tests', async () => {
    const sleep = vi.fn(async () => undefined)
    await humanizedDispatch(buildTextMessage({ to: '1', body: 'x' }), {
      client: {
        sendPresence: vi.fn(async () => ({ status: 201, body: {} })),
        sendMessage: vi.fn(async () => ({ status: 201, body: {} })),
      } as unknown as WahaClient,
      minDelayMs: 0,
      maxDelayMs: 0,
      sleep,
    })
    expect(sleep).toHaveBeenCalledWith(0)
  })
})
