//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { parseEnv } from '../contracts/env.js'

// Valid env fixture - minimal required Meta credentials for startup.
const validEnv = {
  WHATSAPP_TOKEN: 'token-abc',
  WHATSAPP_PHONE_NUMBER_ID: '123456',
  WHATSAPP_VERIFY_TOKEN: 'verify-me',
}

describe('parseEnv', () => {
  // Accepts complete credentials - returns ok with defaults for optional fields.
  it('accepts required Meta credentials and pins Graph version default', () => {
    const result = parseEnv(validEnv)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.env.WHATSAPP_TOKEN).toBe('token-abc')
      expect(result.env.META_GRAPH_API_VERSION).toBe('v21.0')
      expect(result.env.PORT).toBe(3000)
    }
  })

  // Rejects missing token - fails fast with a clear error mentioning the key.
  it('fails fast when WHATSAPP_TOKEN is missing', () => {
    const result = parseEnv({
      WHATSAPP_PHONE_NUMBER_ID: '123',
      WHATSAPP_VERIFY_TOKEN: 'v',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('WHATSAPP_TOKEN')
    }
  })
})
