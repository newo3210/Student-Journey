//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Text outbound input - destination WhatsApp number and plain body.
export const textOutboundInputSchema = z.object({
  to: z.string().min(1),
  body: z.string().min(1),
})
export type TextOutboundInput = z.infer<typeof textOutboundInputSchema>

// Interactive button definition - id and visible title (unstable on Baileys).
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

// Interactive list input - sectioned list (documented optional / unstable).
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

// Outbound message kinds - discriminated union for adapter + humanizer.
export type OutboundMessage =
  | { kind: 'text'; to: string; text: string }
  | {
      kind: 'buttons'
      to: string
      title?: string
      description: string
      footer?: string
      buttons: Array<{ id: string; displayText: string }>
    }
  | {
      kind: 'list'
      to: string
      title?: string
      description: string
      buttonText: string
      footer?: string
      sections: Array<{
        title: string
        rows: Array<{ id: string; title: string; description?: string }>
      }>
    }
  | {
      kind: 'media'
      to: string
      mediatype: 'image' | 'document'
      media: string
      caption?: string
      fileName?: string
    }
