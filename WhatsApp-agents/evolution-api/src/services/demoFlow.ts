//Mariano Montini ('bosque', 'bosquestudio')
import type { OutboundMessage } from '../contracts/outbound.js'
import {
  buildInteractiveButtonsMessage,
  buildMediaMessage,
  buildTextMessage,
} from './outboundBuilders.js'

// Demo keywords - inbound text triggers that open the menu or send a coupon.
const MENU_KEYWORDS = new Set(['hi', 'hello', 'hola', 'menu', 'start', 'ayuda'])
const COUPON_KEYWORDS = new Set(['coupon', 'cupon', 'pdf', 'promo'])

// Interactive reply ids - deterministic button ids used in the demo menu.
export const DEMO_BUTTON_IDS = {
  info: 'menu_info',
  coupon: 'menu_coupon',
  help: 'menu_help',
} as const

// Demo flow options - coupon media URL from env for document sends.
export type DemoFlowOptions = {
  couponMediaUrl: string
}

// Demo action - outbound message(s) the inbound handler should send.
export type DemoAction = {
  messages: OutboundMessage[]
}

// Resolve demo reply - maps keyword or interactive id to outbound Evolution messages.
export function resolveDemoAction(
  input: { type: string; textBody?: string; interactiveId?: string },
  options: DemoFlowOptions,
): DemoAction {
  const to = '__TO__'

  if (input.type === 'interactive' && input.interactiveId) {
    return resolveInteractive(input.interactiveId, to, options)
  }

  if (input.type !== 'text') {
    return { messages: [] }
  }

  const text = (input.textBody ?? '').trim().toLowerCase()

  if (MENU_KEYWORDS.has(text) || text === '') {
    return { messages: [buildMenuMessage(to)] }
  }

  if (COUPON_KEYWORDS.has(text)) {
    return {
      messages: [
        buildMediaMessage({
          to,
          type: 'document',
          link: options.couponMediaUrl,
          caption: 'Your demo coupon PDF',
          filename: 'coupon.pdf',
        }),
      ],
    }
  }

  return {
    messages: [
      buildTextMessage({
        to,
        body: `You said: "${input.textBody ?? ''}". Send "menu" for options or "coupon" for a PDF.`,
      }),
    ],
  }
}

// Build menu message - interactive reply buttons for the Level 1 demo.
function buildMenuMessage(to: string): OutboundMessage {
  return buildInteractiveButtonsMessage({
    to,
    headerText: 'Demo bot',
    bodyText: 'Choose an option to continue the Level 1 demo.',
    footerText: 'Evolution API template',
    buttons: [
      { id: DEMO_BUTTON_IDS.info, title: 'Info' },
      { id: DEMO_BUTTON_IDS.coupon, title: 'Coupon PDF' },
      { id: DEMO_BUTTON_IDS.help, title: 'Help' },
    ],
  })
}

// Resolve interactive selection - maps button id to text or media follow-up.
function resolveInteractive(
  interactiveId: string,
  to: string,
  options: DemoFlowOptions,
): DemoAction {
  switch (interactiveId) {
    case DEMO_BUTTON_IDS.info:
      return {
        messages: [
          buildTextMessage({
            to,
            body: 'This is the Evolution API Level 1 demo: text, interactive buttons, and media with presence+delay humanization.',
          }),
        ],
      }
    case DEMO_BUTTON_IDS.coupon:
      return {
        messages: [
          buildTextMessage({ to, body: 'Sending your coupon document…' }),
          buildMediaMessage({
            to,
            type: 'document',
            link: options.couponMediaUrl,
            caption: 'Demo coupon',
            filename: 'coupon.pdf',
          }),
        ],
      }
    case DEMO_BUTTON_IDS.help:
      return {
        messages: [
          buildTextMessage({
            to,
            body: 'Keywords: menu | coupon | hi. Buttons: Info, Coupon PDF, Help.',
          }),
        ],
      }
    default:
      return {
        messages: [
          buildTextMessage({
            to,
            body: `Unknown option "${interactiveId}". Send "menu" to try again.`,
          }),
        ],
      }
  }
}

// Bind recipient - replaces placeholder `to` with the real WhatsApp user id.
export function bindRecipient(messages: OutboundMessage[], to: string): OutboundMessage[] {
  return messages.map((message) => ({ ...message, to }))
}
