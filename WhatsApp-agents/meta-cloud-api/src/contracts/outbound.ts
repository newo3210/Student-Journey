//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Text outbound input - destination WhatsApp id and plain body.
export const textOutboundInputSchema = z.object({
  to: z.string().min(1),
  body: z.string().min(1),
})

export type TextOutboundInput = z.infer<typeof textOutboundInputSchema>

// Interactive button definition - id and visible title for reply buttons.
export const interactiveButtonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(20),
})

// Interactive buttons input - header/body/footer plus up to three buttons.
export const interactiveButtonsInputSchema = z.object({
  to: z.string().min(1),
  bodyText: z.string().min(1),
  buttons: z.array(interactiveButtonSchema).min(1).max(3),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
})

export type InteractiveButtonsInput = z.infer<typeof interactiveButtonsInputSchema>

// List row definition - id, title, optional description for list messages.
export const listRowSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(24),
  description: z.string().max(72).optional(),
})

// Interactive list input - sectioned list payload for Meta Cloud API.
export const interactiveListInputSchema = z.object({
  to: z.string().min(1),
  bodyText: z.string().min(1),
  buttonText: z.string().min(1).max(20),
  sections: z
    .array(
      z.object({
        title: z.string().min(1).max(24),
        rows: z.array(listRowSchema).min(1),
      }),
    )
    .min(1),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
})

export type InteractiveListInput = z.infer<typeof interactiveListInputSchema>

// Media outbound input - image or document with link and optional caption/filename.
export const mediaOutboundInputSchema = z.object({
  to: z.string().min(1),
  type: z.enum(['image', 'document']),
  link: z.string().url(),
  caption: z.string().optional(),
  filename: z.string().optional(),
})

export type MediaOutboundInput = z.infer<typeof mediaOutboundInputSchema>

// Graph message envelope - messaging_product plus typed content.
export type GraphMessagePayload = {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: string
  text?: { preview_url: boolean; body: string }
  interactive?: unknown
  image?: { link: string; caption?: string }
  document?: { link: string; caption?: string; filename?: string }
}
