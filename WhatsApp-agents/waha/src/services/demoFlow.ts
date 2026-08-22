//Mariano Montini ('bosque', 'bosquestudio')
import type { OutboundMessage } from '../contracts/outbound.js'
import {
  buildInteractiveButtonsMessage,
  buildInteractiveListMessage,
  buildMediaMessage,
  buildTextMessage,
} from './outboundBuilders.js'

// Demo keywords - inbound text triggers that open the menu or send a coupon.
const MENU_KEYWORDS = new Set(['hi', 'hello', 'hola', 'menu', 'start', 'ayuda'])
const COUPON_KEYWORDS = new Set(['coupon', 'cupon', 'pdf', 'promo', '2'])

// Interactive reply ids - deterministic button ids used in the demo menu.
export const DEMO_BUTTON_IDS = {
  info: 'menu_info',
  coupon: 'menu_coupon',
  help: 'menu_help',
} as const

// Demo flow options - coupon media URL and menu mode (text fallback vs native).
export type DemoFlowOptions = {
  couponMediaUrl: string
  menuMode?: 'text' | 'buttons' | 'list'
}

// Demo action - outbound message(s) the inbound handler should send.
export type DemoAction = {
  messages: OutboundMessage[]
}

// Resolve demo reply - maps keyword or interactive id to outbound Waha messages.
export function resolveDemoAction(
  input: { type: string; textBody?: string; interactiveId?: string },
  options: DemoFlowOptions,
): DemoAction {
  const to = '__TO__'
  const menuMode = options.menuMode ?? 'text'

  if (input.type === 'interactive' && input.interactiveId) {
    return resolveInteractive(input.interactiveId, to, options)
  }

  if (input.type !== 'text') {
    return { messages: [] }
  }

  const text = (input.textBody ?? '').trim().toLowerCase()

  if (text === '1' || text === 'info' || text === DEMO_BUTTON_IDS.info) {
    return resolveInteractive(DEMO_BUTTON_IDS.info, to, options)
  }
  if (text === '3' || text === 'help' || text === DEMO_BUTTON_IDS.help) {
    return resolveInteractive(DEMO_BUTTON_IDS.help, to, options)
  }

  if (MENU_KEYWORDS.has(text) || text === '') {
    return { messages: [buildMenuMessage(to, menuMode)] }
  }

  if (COUPON_KEYWORDS.has(text) || text === DEMO_BUTTON_IDS.coupon) {
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

// Build menu message - native buttons/list when requested, otherwise numbered text fallback.
function buildMenuMessage(to: string, menuMode: 'text' | 'buttons' | 'list'): OutboundMessage {
  const bodyText =
    'Choose an option to continue the Level 1 demo.\n1) Info\n2) Coupon PDF\n3) Help'

  if (menuMode === 'buttons') {
    return buildInteractiveButtonsMessage({
      to,
      headerText: 'Demo bot',
      bodyText,
      footerText: 'Waha template',
      buttons: [
        { id: DEMO_BUTTON_IDS.info, title: 'Info' },
        { id: DEMO_BUTTON_IDS.coupon, title: 'Coupon PDF' },
        { id: DEMO_BUTTON_IDS.help, title: 'Help' },
      ],
    })
  }

  if (menuMode === 'list') {
    return buildInteractiveListMessage({
      to,
      headerText: 'Demo bot',
      bodyText,
      buttonText: 'Options',
      footerText: 'Waha template',
      sections: [
        {
          title: 'Menu',
          rows: [
            { id: DEMO_BUTTON_IDS.info, title: 'Info' },
            { id: DEMO_BUTTON_IDS.coupon, title: 'Coupon PDF' },
            { id: DEMO_BUTTON_IDS.help, title: 'Help' },
          ],
        },
      ],
    })
  }

  return buildTextMessage({
    to,
    body: `Demo bot — ${bodyText}\nReply with 1, 2, 3, or keywords info / coupon / help.`,
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
            body: 'This is the Waha Level 1 demo: text, optional buttons/list (or text fallback), and media with presence+delay humanization.',
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
            body: 'Keywords: menu | coupon | hi. Options: 1 Info, 2 Coupon PDF, 3 Help. Native buttons/list only if WAHA_MENU_MODE is set and the engine supports them.',
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
