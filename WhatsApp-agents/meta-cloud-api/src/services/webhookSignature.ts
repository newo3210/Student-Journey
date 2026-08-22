//Mariano Montini ('bosque', 'bosquestudio')
import { createHmac, timingSafeEqual } from 'node:crypto'

// Signature header result - accept or reject with HTTP status for forged POSTs.
export type SignatureValidationResult =
  | { ok: true }
  | { ok: false; status: 401 | 403; reason: string }

// Validate X-Hub-Signature-256 - HMAC-SHA256 of raw body when app secret is configured.
export function validateHubSignature(
  rawBody: Buffer | undefined,
  signatureHeader: string | undefined,
  appSecret: string,
): SignatureValidationResult {
  if (!rawBody || rawBody.length === 0) {
    return { ok: false, status: 401, reason: 'missing raw body for signature check' }
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return { ok: false, status: 401, reason: 'missing or malformed X-Hub-Signature-256' }
  }

  const expectedHex = createHmac('sha256', appSecret).update(rawBody).digest('hex')
  const expected = Buffer.from(`sha256=${expectedHex}`, 'utf8')
  const actual = Buffer.from(signatureHeader, 'utf8')

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, status: 403, reason: 'invalid X-Hub-Signature-256' }
  }

  return { ok: true }
}
