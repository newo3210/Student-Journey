//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Remote Jid helpers - strip WhatsApp suffixes to a bare phone/number id.
export function normalizeRemoteJid(remoteJid: string): string {
  return remoteJid.replace(/@.+$/, '')
}

// Button response fragment - Evolution buttonsResponseMessage shape.
const buttonsResponseSchema = z.object({
  selectedButtonId: z.string().optional(),
  selectedDisplayText: z.string().optional(),
})

// List response fragment - Evolution listResponseMessage shape.
const listResponseSchema = z.object({
  title: z.string().optional(),
  singleSelectReply: z
    .object({
      selectedRowId: z.string().optional(),
    })
    .optional(),
})

// Inbound message body - conversation, extended text, or interactive replies.
const inboundMessageBodySchema = z
  .object({
    conversation: z.string().optional(),
    extendedTextMessage: z.object({ text: z.string().optional() }).optional(),
    buttonsResponseMessage: buttonsResponseSchema.optional(),
    listResponseMessage: listResponseSchema.optional(),
  })
  .passthrough()

// Webhook data key - Evolution message key with remoteJid / fromMe / id.
const messageKeySchema = z.object({
  remoteJid: z.string(),
  fromMe: z.boolean().optional(),
  id: z.string().optional(),
})

// Webhook data payload - Evolution messages.upsert `data` object.
const webhookDataSchema = z.object({
  key: messageKeySchema,
  pushName: z.string().optional(),
  message: inboundMessageBodySchema.optional(),
  messageType: z.string().optional(),
})

// Full webhook body - Evolution event envelope (messages.upsert and aliases).
export const webhookBodySchema = z.object({
  event: z.string().optional(),
  instance: z.string().optional(),
  data: z.union([webhookDataSchema, z.array(webhookDataSchema)]).optional(),
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

// Infer inbound type - text vs interactive from Evolution message fragments.
function inferType(data: z.infer<typeof webhookDataSchema>): string {
  const message = data.message
  if (message?.buttonsResponseMessage?.selectedButtonId) return 'interactive'
  if (message?.listResponseMessage?.singleSelectReply?.selectedRowId) return 'interactive'
  if (data.messageType === 'conversation' || data.messageType === 'extendedTextMessage') return 'text'
  if (message?.conversation || message?.extendedTextMessage?.text) return 'text'
  return data.messageType ?? 'unknown'
}

// Extract first inbound message - normalizes Evolution webhook into one event.
export function extractInboundEvent(body: unknown): InboundEvent | null {
  const parsed = webhookBodySchema.safeParse(body)
  if (!parsed.success) return null

  const rawData = parsed.data.data
  const data = Array.isArray(rawData) ? rawData[0] : rawData
  if (!data?.key?.remoteJid) return null
  if (data.key.fromMe !== false) return null

  const message = data.message
  const textBody = message?.conversation ?? message?.extendedTextMessage?.text
  const interactiveId =
    message?.buttonsResponseMessage?.selectedButtonId ??
    message?.listResponseMessage?.singleSelectReply?.selectedRowId
  const interactiveTitle =
    message?.buttonsResponseMessage?.selectedDisplayText ?? message?.listResponseMessage?.title
  const type = inferType(data)

  if (type !== 'interactive' && !textBody) return null

  return {
    from: normalizeRemoteJid(data.key.remoteJid),
    messageId: data.key.id ?? 'unknown',
    type,
    textBody,
    interactiveId,
    interactiveTitle,
  }
}
