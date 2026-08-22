//Mariano Montini ('bosque', 'bosquestudio')
import {
  type InteractiveButtonsInput,
  type InteractiveListInput,
  type MediaOutboundInput,
  type GraphMessagePayload,
  type TextOutboundInput,
  interactiveButtonsInputSchema,
  interactiveListInputSchema,
  mediaOutboundInputSchema,
  textOutboundInputSchema,
} from '../contracts/outbound.js'

// Build text payload - Graph API messages text type from validated input.
export function buildTextPayload(input: TextOutboundInput): GraphMessagePayload {
  const data = textOutboundInputSchema.parse(input)
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: data.to,
    type: 'text',
    text: {
      preview_url: false,
      body: data.body,
    },
  }
}

// Build interactive buttons payload - reply buttons interactive message.
export function buildInteractiveButtonsPayload(input: InteractiveButtonsInput): GraphMessagePayload {
  const data = interactiveButtonsInputSchema.parse(input)
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: data.to,
    type: 'interactive',
    interactive: {
      type: 'button',
      ...(data.headerText ? { header: { type: 'text', text: data.headerText } } : {}),
      body: { text: data.bodyText },
      ...(data.footerText ? { footer: { text: data.footerText } } : {}),
      action: {
        buttons: data.buttons.map((button) => ({
          type: 'reply',
          reply: { id: button.id, title: button.title },
        })),
      },
    },
  }
}

// Build interactive list payload - list message with sections and rows.
export function buildInteractiveListPayload(input: InteractiveListInput): GraphMessagePayload {
  const data = interactiveListInputSchema.parse(input)
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: data.to,
    type: 'interactive',
    interactive: {
      type: 'list',
      ...(data.headerText ? { header: { type: 'text', text: data.headerText } } : {}),
      body: { text: data.bodyText },
      ...(data.footerText ? { footer: { text: data.footerText } } : {}),
      action: {
        button: data.buttonText,
        sections: data.sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row) => ({
            id: row.id,
            title: row.title,
            ...(row.description ? { description: row.description } : {}),
          })),
        })),
      },
    },
  }
}

// Build media payload - image or document message with optional caption/filename.
export function buildMediaPayload(input: MediaOutboundInput): GraphMessagePayload {
  const data = mediaOutboundInputSchema.parse(input)
  const base: GraphMessagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: data.to,
    type: data.type,
  }

  if (data.type === 'image') {
    return {
      ...base,
      image: {
        link: data.link,
        ...(data.caption ? { caption: data.caption } : {}),
      },
    }
  }

  return {
    ...base,
    document: {
      link: data.link,
      ...(data.caption ? { caption: data.caption } : {}),
      ...(data.filename ? { filename: data.filename } : {}),
    },
  }
}
