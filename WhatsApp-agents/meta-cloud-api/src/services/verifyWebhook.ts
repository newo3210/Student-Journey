//Mariano Montini ('bosque', 'bosquestudio')
import { timingSafeEqual } from 'node:crypto'

// Verify-token inputs - query fields from Meta plus configured verify token.
export type VerifyWebhookInput = {
  mode: string | undefined
  verifyToken: string | undefined
  challenge: string | undefined
  expectedToken: string
}

// Verify result - either the challenge string to echo or a forbidden reason.
export type VerifyWebhookResult =
  | { ok: true; challenge: string }
  | { ok: false; status: 403; reason: string }

// Constant-time string compare - length mismatch returns false without throwing.
function safeTokenEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

// Verify subscription challenge - accepts only subscribe mode with matching token.
export function verifyWebhookChallenge(input: VerifyWebhookInput): VerifyWebhookResult {
  const { mode, verifyToken, challenge, expectedToken } = input

  if (mode !== 'subscribe') {
    return { ok: false, status: 403, reason: 'hub.mode must be subscribe' }
  }

  if (!verifyToken || !safeTokenEqual(verifyToken, expectedToken)) {
    return { ok: false, status: 403, reason: 'verify token mismatch' }
  }

  if (!challenge) {
    return { ok: false, status: 403, reason: 'missing hub.challenge' }
  }

  return { ok: true, challenge }
}
