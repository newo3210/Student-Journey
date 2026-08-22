//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { verifyWebhookChallenge } from '../services/verifyWebhook.js'

describe('verifyWebhookChallenge', () => {
  // Accept path - matching subscribe token returns the challenge string.
  it('accepts subscribe mode with matching verify token', () => {
    const result = verifyWebhookChallenge({
      mode: 'subscribe',
      verifyToken: 'secret-token',
      challenge: '12345',
      expectedToken: 'secret-token',
    })
    expect(result).toEqual({ ok: true, challenge: '12345' })
  })

  // Reject path - mismatched token yields 403 and does not echo challenge.
  it('rejects mismatched verify token with 403', () => {
    const result = verifyWebhookChallenge({
      mode: 'subscribe',
      verifyToken: 'wrong',
      challenge: '12345',
      expectedToken: 'secret-token',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(403)
    }
  })

  // Reject path - non-subscribe mode is forbidden.
  it('rejects when hub.mode is not subscribe', () => {
    const result = verifyWebhookChallenge({
      mode: 'unsubscribe',
      verifyToken: 'secret-token',
      challenge: '12345',
      expectedToken: 'secret-token',
    })
    expect(result.ok).toBe(false)
  })

  // Length mismatch - different-length tokens reject without throwing.
  it('rejects different-length tokens safely', () => {
    const result = verifyWebhookChallenge({
      mode: 'subscribe',
      verifyToken: 'short',
      challenge: '12345',
      expectedToken: 'much-longer-expected-token',
    })
    expect(result.ok).toBe(false)
  })
})
