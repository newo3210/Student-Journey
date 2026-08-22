//Mariano Montini ('bosque', 'bosquestudio')
import type { GraphMessagePayload } from '../contracts/outbound.js'
import {
  buildInteractiveButtonsPayload,
  buildMediaPayload,
  buildTextPayload,
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

// Demo action - outbound payload(s) the inbound handler should send.
export type DemoAction = {
  payloads: GraphMessagePayload[]
}

// Resolve demo reply - maps keyword or interactive id to outbound Graph payloads.
export function resolveDemoAction(
  input: {
    type: string
    textBody?: string
    interactiveId?: string
  },
  options: DemoFlowOptions,
): DemoAction {
  const to = '__TO__'

  if (input.type === 'interactive' && input.interactiveId) {
    return resolveInteractive(input.interactiveId, to, options)
  }

  // Non-text inbound - ignore image/audio/sticker/etc.; menu is text-only.
  if (input.type !== 'text') {
    return { payloads: [] }
  }

  const text = (input.textBody ?? '').trim().toLowerCase()

  if (MENU_KEYWORDS.has(text) || text === '') {
    return { payloads: [buildMenuPayload(to)] }
  }

  if (COUPON_KEYWORDS.has(text)) {
    return {
      payloads: [
        buildMediaPayload({
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
    payloads: [
      buildTextPayload({
        to,
        body: `You said: "${input.textBody ?? ''}". Send "menu" for options or "coupon" for a PDF.`,
      }),
    ],
  }
}

// Build menu payload - interactive reply buttons for the Level 1 demo.
function buildMenuPayload(to: string): GraphMessagePayload {
  return buildInteractiveButtonsPayload({
    to,
    headerText: 'Demo bot',
    bodyText: 'Choose an option to continue the Level 1 demo.',
    footerText: 'Meta Cloud API template',
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
        payloads: [
          buildTextPayload({
            to,
            body: 'This is the Meta Cloud API Level 1 demo: text, interactive buttons, and media.',
          }),
        ],
      }
    case DEMO_BUTTON_IDS.coupon:
      return {
        payloads: [
          buildTextPayload({
            to,
            body: 'Sending your coupon document…',
          }),
          buildMediaPayload({
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
        payloads: [
          buildTextPayload({
            to,
            body: 'Keywords: menu | coupon | hi. Buttons: Info, Coupon PDF, Help.',
          }),
        ],
      }
    default:
      return {
        payloads: [
          buildTextPayload({
            to,
            body: `Unknown option "${interactiveId}". Send "menu" to try again.`,
          }),
        ],
      }
  }
}

// Bind recipient - replaces placeholder `to` with the real WhatsApp user id.
export function bindRecipient(payloads: GraphMessagePayload[], to: string): GraphMessagePayload[] {
  return payloads.map((payload) => ({ ...payload, to }))
}
