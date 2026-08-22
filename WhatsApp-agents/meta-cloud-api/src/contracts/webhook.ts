//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Verify-query fields - Meta subscription challenge query parameters.
export const webhookVerifyQuerySchema = z.object({
  'hub.mode': z.string(),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string(),
})

// Verify query type - GET webhook subscription payload.
export type WebhookVerifyQuery = z.infer<typeof webhookVerifyQuerySchema>

// Text message body - inbound WhatsApp text payload fragment.
const textBodySchema = z.object({
  body: z.string(),
})

// Interactive button reply - user selected a reply button.
const buttonReplySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
})

// Interactive list reply - user selected a list row.
const listReplySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
})

// Interactive payload - button or list reply from the user.
const interactiveSchema = z.object({
  type: z.string(),
  button_reply: buttonReplySchema.optional(),
  list_reply: listReplySchema.optional(),
})

// Inbound message - single WhatsApp message inside a webhook change.
export const inboundMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string().optional(),
  type: z.string(),
  text: textBodySchema.optional(),
  interactive: interactiveSchema.optional(),
})

// Webhook change value - Meta messages webhook change container.
const changeValueSchema = z.object({
  messaging_product: z.string().optional(),
  metadata: z
    .object({
      display_phone_number: z.string().optional(),
      phone_number_id: z.string().optional(),
    })
    .optional(),
  messages: z.array(inboundMessageSchema).optional(),
  statuses: z.array(z.unknown()).optional(),
})

// Full webhook body - Meta Cloud API POST envelope.
export const webhookBodySchema = z.object({
  object: z.string().optional(),
  entry: z
    .array(
      z.object({
        id: z.string().optional(),
        changes: z
          .array(
            z.object({
              field: z.string().optional(),
              value: changeValueSchema,
            }),
          )
          .optional(),
      }),
    )
    .optional(),
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

// Extract first inbound message - flattens Meta nested webhook into one event.
export function extractInboundEvent(body: unknown): InboundEvent | null {
  const parsed = webhookBodySchema.safeParse(body)
  if (!parsed.success) {
    return null
  }

  const messages = parsed.data.entry?.[0]?.changes?.[0]?.value?.messages
  const message = messages?.[0]
  if (!message) {
    return null
  }

  const interactiveId = message.interactive?.button_reply?.id ?? message.interactive?.list_reply?.id
  const interactiveTitle =
    message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title

  return {
    from: message.from,
    messageId: message.id,
    type: message.type,
    textBody: message.text?.body,
    interactiveId,
    interactiveTitle,
  }
}
