//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { extractInboundEvent, normalizeRemoteJid } from './webhook.js'

// Sample text webhook - Waha `message` event with fromMe false.
function textWebhook(body: string) {
  return {
    event: 'message',
    session: 'default',
    payload: {
      id: 'false_5491112345678@c.us_WAHA.TEXT1',
      from: '5491112345678@c.us',
      fromMe: false,
      body,
    },
  }
}

describe('normalizeRemoteJid', () => {
  it('strips @c.us suffix', () => {
    expect(normalizeRemoteJid('54911@c.us')).toBe('54911')
  })
})

describe('extractInboundEvent', () => {
  it('extracts inbound text fields from Waha webhook body', () => {
    expect(extractInboundEvent(textWebhook('hello'))).toEqual({
      from: '5491112345678',
      messageId: 'false_5491112345678@c.us_WAHA.TEXT1',
      type: 'text',
      textBody: 'hello',
      interactiveId: undefined,
      interactiveTitle: undefined,
    })
  })

  it('extracts interactive button reply id and title', () => {
    const event = extractInboundEvent({
      event: 'message',
      payload: {
        id: 'WAHA.BTN1',
        from: '5491112345678@c.us',
        fromMe: false,
        buttonsResponse: {
          selectedButtonId: 'menu_coupon',
          selectedDisplayText: 'Coupon PDF',
        },
      },
    })
    expect(event?.type).toBe('interactive')
    expect(event?.interactiveId).toBe('menu_coupon')
    expect(event?.interactiveTitle).toBe('Coupon PDF')
  })

  it('extracts list reply selected row id', () => {
    const event = extractInboundEvent({
      event: 'message',
      payload: {
        id: 'WAHA.LIST1',
        from: '54911@c.us',
        fromMe: false,
        listResponse: { title: 'Info', rowId: 'menu_info' },
      },
    })
    expect(event?.interactiveId).toBe('menu_info')
    expect(event?.type).toBe('interactive')
  })

  it('returns null when fromMe is true', () => {
    expect(
      extractInboundEvent({
        event: 'message',
        payload: { from: '54911@c.us', fromMe: true, id: 'x', body: 'hi' },
      }),
    ).toBeNull()
  })

  it('returns null when fromMe is omitted', () => {
    expect(
      extractInboundEvent({
        event: 'message',
        payload: { from: '54911@c.us', id: 'x', body: 'hi' },
      }),
    ).toBeNull()
  })

  it('returns null when webhook has no usable message content', () => {
    expect(extractInboundEvent({ event: 'session.status', payload: {} })).toBeNull()
  })
})
