//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { parseEnv } from './env.js'

describe('parseEnv', () => {
  // Accepts empty env - defaults auth dir, port, menu text, delay range.
  it('accepts defaults and pins delay and text menu', () => {
    const result = parseEnv({})
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.env.BAILEYS_AUTH_DIR).toBe('./auth_info_baileys')
      expect(result.env.PORT).toBe(3003)
      expect(result.env.HUMANIZE_MIN_MS).toBe(20_000)
      expect(result.env.HUMANIZE_MAX_MS).toBe(45_000)
      expect(result.env.BAILEYS_MENU_MODE).toBe('text')
    }
  })

  // Rejects inverted delay range - max must be >= min.
  it('fails when HUMANIZE_MAX_MS is less than HUMANIZE_MIN_MS', () => {
    const result = parseEnv({
      HUMANIZE_MIN_MS: '100',
      HUMANIZE_MAX_MS: '50',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('HUMANIZE_MAX_MS')
    }
  })

  // Production delay floor - NODE_ENV=production rejects 0 ms humanize bypass.
  it('rejects HUMANIZE_MIN_MS 0 when NODE_ENV is production', () => {
    const result = parseEnv({
      NODE_ENV: 'production',
      HUMANIZE_MIN_MS: '0',
      HUMANIZE_MAX_MS: '0',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/HUMANIZE_MIN_MS|HUMANIZE_MAX_MS/)
    }
  })

  // Non-production delay bypass - tests may use 0/0 with injectable sleep.
  it('accepts HUMANIZE delays of 0 when NODE_ENV is test', () => {
    const result = parseEnv({
      NODE_ENV: 'test',
      HUMANIZE_MIN_MS: '0',
      HUMANIZE_MAX_MS: '0',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.env.HUMANIZE_MIN_MS).toBe(0)
      expect(result.env.HUMANIZE_MAX_MS).toBe(0)
    }
  })

  // Rejects invalid coupon URL - fail fast on outbound media contract.
  it('fails fast when COUPON_MEDIA_URL is not a URL', () => {
    const result = parseEnv({ COUPON_MEDIA_URL: 'not-a-url' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('COUPON_MEDIA_URL')
    }
  })
})
