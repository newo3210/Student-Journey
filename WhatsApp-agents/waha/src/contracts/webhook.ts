//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Remote Jid helpers - strip WhatsApp suffixes to a bare phone/number id.
export function normalizeRemoteJid(remoteJid: string): string {
  return remoteJid.replace(/@.+$/, '')
}

// List / button reply fragments - Waha engine-specific interactive shapes.
const listReplySchema = z
  .object({
    rowId: z.string().optional(),
    title: z.string().optional(),
    id: z.string().optional(),
  })
  .passthrough()

const buttonsReplySchema = z
  .object({
    selectedButtonId: z.string().optional(),
    selectedDisplayText: z.string().optional(),
    buttonId: z.string().optional(),
  })
  .passthrough()

// Inbound payload - Waha `message` event payload (from / fromMe / body).
const webhookPayloadSchema = z
  .object({
    id: z.string().optional(),
    from: z.string().optional(),
    chatId: z.string().optional(),
    fromMe: z.boolean().optional(),
    body: z.string().optional(),
    type: z.string().optional(),
    selectedButtonId: z.string().optional(),
    listResponse: listReplySchema.optional(),
    buttonsResponse: buttonsReplySchema.optional(),
    _data: z.record(z.unknown()).optional(),
  })
  .passthrough()

// Full webhook body - Waha event envelope (`event` + `payload`).
export const webhookBodySchema = z.object({
  event: z.string().optional(),
  session: z.string().optional(),
  payload: webhookPayloadSchema.optional(),
})

// Parsed inbound event - normalized fields used by application services.
export type InboundEvent = {
  from: string
  messageId: string
  type: string
  textBody?: string
  interactiveId?: string
  interactiveTitle?: string
}

// Read nested string - conservative lookup into passthrough `_data`.
function nestedString(record: Record<string, unknown> | undefined, path: string[]): string | undefined {
  let current: unknown = record
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : undefined
}

// Infer inbound type - text vs interactive from Waha payload fragments.
function inferType(
  payload: z.infer<typeof webhookPayloadSchema>,
  interactiveId: string | undefined,
): string {
  if (interactiveId) return 'interactive'
  if (payload.type && payload.type !== 'chat' && payload.type !== 'text') return payload.type
  if (payload.body) return 'text'
  return payload.type ?? 'unknown'
}

// Extract first inbound message - normalizes Waha webhook into one event.
export function extractInboundEvent(body: unknown): InboundEvent | null {
  const parsed = webhookBodySchema.safeParse(body)
  if (!parsed.success) return null

  const eventName = parsed.data.event
  if (eventName && eventName !== 'message' && eventName !== 'message.any') return null

  const payload = parsed.data.payload
  const from = payload?.from ?? payload?.chatId
  if (!from) return null
  if (payload.fromMe !== false) return null

  const interactiveId =
    payload.selectedButtonId ??
    payload.listResponse?.rowId ??
    payload.listResponse?.id ??
    payload.buttonsResponse?.selectedButtonId ??
    payload.buttonsResponse?.buttonId ??
    nestedString(payload._data, ['listResponse', 'rowId']) ??
    nestedString(payload._data, ['selectedButtonId'])

  const interactiveTitle =
    payload.listResponse?.title ?? payload.buttonsResponse?.selectedDisplayText

  const textBody = payload.body
  const type = inferType(payload, interactiveId)

  if (type !== 'interactive' && !textBody) return null

  return {
    from: normalizeRemoteJid(from),
    messageId: payload.id ?? 'unknown',
    type,
    textBody,
    interactiveId,
    interactiveTitle,
  }
}
