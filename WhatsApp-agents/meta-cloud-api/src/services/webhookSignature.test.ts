//Mariano Montini ('bosque', 'bosquestudio')
import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { validateHubSignature } from './webhookSignature.js'

// Sign helper - builds Meta-style sha256= HMAC for test bodies.
function sign(raw: Buffer, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`
}

describe('validateHubSignature', () => {
  const secret = 'app-secret-test'
  const rawBody = Buffer.from('{"entry":[]}', 'utf8')

  // Valid signature - matching HMAC over raw body is accepted.
  it('accepts a valid X-Hub-Signature-256', () => {
    const result = validateHubSignature(rawBody, sign(rawBody, secret), secret)
    expect(result).toEqual({ ok: true })
  })

  // Missing header - rejected without calling Graph (caller responsibility).
  it('rejects when signature header is missing', () => {
    const result = validateHubSignature(rawBody, undefined, secret)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(401)
    }
  })

  // Invalid HMAC - forged or wrong secret is rejected.
  it('rejects when signature does not match', () => {
    const result = validateHubSignature(rawBody, sign(rawBody, 'wrong-secret'), secret)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(403)
    }
  })
})
