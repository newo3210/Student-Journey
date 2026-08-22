//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Remote Jid helpers - strip WhatsApp suffixes to a bare phone/number id.
export function normalizeRemoteJid(remoteJid: string): string {
  return remoteJid.replace(/@.+$/, '')
}

// List / button reply fragments - optional interactive shapes (unstable on Baileys).
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

// Inbound payload - HTTP simulator / socket-normalized message (from / fromMe / body).
const webhookPayloadSchema = z
  .object({
    id: z.string().optional(),
    from: z.string().optional(),
    remoteJid: z.string().optional(),
    chatId: z.string().optional(),
    fromMe: z.boolean().optional(),
    body: z.string().optional(),
    type: z.string().optional(),
    selectedButtonId: z.string().optional(),
    listResponse: listReplySchema.optional(),
    buttonsResponse: buttonsReplySchema.optional(),
  })
  .passthrough()

// Full webhook body - simulator envelope (`event` + `payload`).
export const webhookBodySchema = z.object({
  event: z.string().optional(),
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

// Infer inbound type - text vs interactive from payload fragments.
function inferType(
  payload: z.infer<typeof webhookPayloadSchema>,
  interactiveId: string | undefined,
): string {
  if (interactiveId) return 'interactive'
  if (payload.type && payload.type !== 'chat' && payload.type !== 'text') return payload.type
  if (payload.body) return 'text'
  return payload.type ?? 'unknown'
}

// Extract first inbound message - normalizes simulator/socket event into one event.
export function extractInboundEvent(body: unknown): InboundEvent | null {
  const parsed = webhookBodySchema.safeParse(body)
  if (!parsed.success) return null

  const eventName = parsed.data.event
  if (eventName && eventName !== 'message' && eventName !== 'messages.upsert') return null

  const payload = parsed.data.payload
  if (!payload) return null
  const from = payload.from ?? payload.remoteJid ?? payload.chatId
  if (!from) return null
  if (payload.fromMe !== false) return null

  const interactiveId =
    payload.selectedButtonId ??
    payload.listResponse?.rowId ??
    payload.listResponse?.id ??
    payload.buttonsResponse?.selectedButtonId ??
    payload.buttonsResponse?.buttonId

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
