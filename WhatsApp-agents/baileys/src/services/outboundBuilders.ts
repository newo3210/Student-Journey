//Mariano Montini ('bosque', 'bosquestudio')
import {
  type InteractiveButtonsInput,
  type InteractiveListInput,
  type MediaOutboundInput,
  type OutboundMessage,
  type TextOutboundInput,
  interactiveButtonsInputSchema,
  interactiveListInputSchema,
  mediaOutboundInputSchema,
  textOutboundInputSchema,
} from '../contracts/outbound.js'

// Build text message - adapter sendText shape from validated input.
export function buildTextMessage(input: TextOutboundInput): OutboundMessage {
  const data = textOutboundInputSchema.parse(input)
  return { kind: 'text', to: data.to, text: data.body }
}

// Build interactive buttons message - optional/unstable native buttons shape.
export function buildInteractiveButtonsMessage(input: InteractiveButtonsInput): OutboundMessage {
  const data = interactiveButtonsInputSchema.parse(input)
  return {
    kind: 'buttons',
    to: data.to,
    ...(data.headerText ? { title: data.headerText } : {}),
    description: data.bodyText,
    ...(data.footerText ? { footer: data.footerText } : {}),
    buttons: data.buttons.map((button) => ({ id: button.id, displayText: button.title })),
  }
}

// Build interactive list message - optional/unstable list shape.
export function buildInteractiveListMessage(input: InteractiveListInput): OutboundMessage {
  const data = interactiveListInputSchema.parse(input)
  return {
    kind: 'list',
    to: data.to,
    ...(data.headerText ? { title: data.headerText } : {}),
    description: data.bodyText,
    buttonText: data.buttonText,
    ...(data.footerText ? { footer: data.footerText } : {}),
    sections: data.sections.map((section) => ({
      title: section.title,
      rows: section.rows.map((row) => ({
        id: row.id,
        title: row.title,
        ...(row.description ? { description: row.description } : {}),
      })),
    })),
  }
}

// Build media message - document or image for sock.sendMessage.
export function buildMediaMessage(input: MediaOutboundInput): OutboundMessage {
  const data = mediaOutboundInputSchema.parse(input)
  return {
    kind: 'media',
    to: data.to,
    mediatype: data.type,
    media: data.link,
    ...(data.caption ? { caption: data.caption } : {}),
    ...(data.filename ? { fileName: data.filename } : {}),
  }
}
