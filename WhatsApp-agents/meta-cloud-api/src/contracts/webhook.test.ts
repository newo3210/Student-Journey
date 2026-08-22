//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { extractInboundEvent } from '../contracts/webhook.js'

// Sample text webhook - Meta change payload with one inbound text message.
function textWebhook(body: string) {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WABA',
        changes: [
          {
            field: 'messages',
            value: {
              messages: [
                {
                  from: '5491112345678',
                  id: 'wamid.TEXT1',
                  timestamp: '1710000000',
                  type: 'text',
                  text: { body },
                },
              ],
            },
          },
        ],
      },
    ],
  }
}

describe('extractInboundEvent', () => {
  // Parses text message - extracts from, messageId, type, and body.
  it('extracts inbound text fields from Meta webhook body', () => {
    const event = extractInboundEvent(textWebhook('hello'))
    expect(event).toEqual({
      from: '5491112345678',
      messageId: 'wamid.TEXT1',
      type: 'text',
      textBody: 'hello',
      interactiveId: undefined,
      interactiveTitle: undefined,
    })
  })

  // Parses interactive reply - extracts button id and title.
  it('extracts interactive button reply id and title', () => {
    const body = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '5491112345678',
                    id: 'wamid.BTN1',
                    type: 'interactive',
                    interactive: {
                      type: 'button_reply',
                      button_reply: { id: 'menu_coupon', title: 'Coupon PDF' },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    }
    const event = extractInboundEvent(body)
    expect(event?.interactiveId).toBe('menu_coupon')
    expect(event?.interactiveTitle).toBe('Coupon PDF')
  })

  // Ignores status-only payloads - returns null when no messages array.
  it('returns null when webhook has no messages', () => {
    expect(extractInboundEvent({ entry: [{ changes: [{ value: { statuses: [] } }] }] })).toBeNull()
  })
})
