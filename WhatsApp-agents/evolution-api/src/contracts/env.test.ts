//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { parseEnv } from './env.js'

// Valid env fixture - minimal required Evolution credentials for startup.
const validEnv = {
  EVOLUTION_API_URL: 'http://localhost:8080',
  EVOLUTION_API_KEY: 'key-abc',
  EVOLUTION_INSTANCE: 'student-demo',
}

describe('parseEnv', () => {
  // Accepts complete credentials - returns ok with defaults for optional fields.
  it('accepts required Evolution credentials and pins delay defaults', () => {
    const result = parseEnv(validEnv)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.env.EVOLUTION_API_KEY).toBe('key-abc')
      expect(result.env.EVOLUTION_INSTANCE).toBe('student-demo')
      expect(result.env.PORT).toBe(3001)
      expect(result.env.HUMANIZE_MIN_MS).toBe(20_000)
      expect(result.env.HUMANIZE_MAX_MS).toBe(45_000)
      expect(result.env.EVOLUTION_API_VERSION).toBe('v2')
    }
  })

  // Rejects missing API key - fails fast with a clear error mentioning the key.
  it('fails fast when EVOLUTION_API_KEY is missing', () => {
    const result = parseEnv({
      EVOLUTION_API_URL: 'http://localhost:8080',
      EVOLUTION_INSTANCE: 'demo',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('EVOLUTION_API_KEY')
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
