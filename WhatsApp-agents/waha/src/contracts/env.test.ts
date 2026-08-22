//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { parseEnv } from './env.js'

// Valid env fixture - minimal required Waha credentials for startup.
const validEnv = {
  WAHA_API_URL: 'http://localhost:3000',
  WAHA_API_KEY: 'key-abc',
  WAHA_SESSION: 'default',
}

describe('parseEnv', () => {
  // Accepts complete credentials - returns ok with defaults for optional fields.
  it('accepts required Waha credentials and pins delay defaults', () => {
    const result = parseEnv(validEnv)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.env.WAHA_API_KEY).toBe('key-abc')
      expect(result.env.WAHA_SESSION).toBe('default')
      expect(result.env.PORT).toBe(3002)
      expect(result.env.HUMANIZE_MIN_MS).toBe(20_000)
      expect(result.env.HUMANIZE_MAX_MS).toBe(45_000)
      expect(result.env.WAHA_MENU_MODE).toBe('text')
    }
  })

  // Rejects missing API key - fails fast with a clear error mentioning the key.
  it('fails fast when WAHA_API_KEY is missing', () => {
    const result = parseEnv({
      WAHA_API_URL: 'http://localhost:3000',
      WAHA_SESSION: 'default',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('WAHA_API_KEY')
    }
  })

  // Rejects inverted delay range - max must be >= min.
  it('fails when HUMANIZE_MAX_MS is less than HUMANIZE_MIN_MS', () => {
    const result = parseEnv({
      ...validEnv,
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
      ...validEnv,
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
      ...validEnv,
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
})
