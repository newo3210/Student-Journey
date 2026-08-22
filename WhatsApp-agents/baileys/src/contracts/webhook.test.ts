//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { extractInboundEvent, normalizeRemoteJid } from './webhook.js'

// Sample text webhook - HTTP simulator `message` event with fromMe false.
function textWebhook(body: string) {
  return {
    event: 'message',
    payload: {
      id: 'BAILEYS.TEXT1',
      from: '5491112345678@s.whatsapp.net',
      fromMe: false,
      body,
    },
  }
}

describe('normalizeRemoteJid', () => {
  it('strips @s.whatsapp.net suffix', () => {
    expect(normalizeRemoteJid('54911@s.whatsapp.net')).toBe('54911')
  })
})

describe('extractInboundEvent', () => {
  it('extracts inbound text fields from simulator webhook body', () => {
    expect(extractInboundEvent(textWebhook('hello'))).toEqual({
      from: '5491112345678',
      messageId: 'BAILEYS.TEXT1',
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
        id: 'BAILEYS.BTN1',
        from: '5491112345678@s.whatsapp.net',
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

  it('returns null when fromMe is true', () => {
    expect(
      extractInboundEvent({
        event: 'message',
        payload: { from: '54911@s.whatsapp.net', fromMe: true, id: 'x', body: 'hi' },
      }),
    ).toBeNull()
  })

  it('returns null when fromMe is omitted', () => {
    expect(
      extractInboundEvent({
        event: 'message',
        payload: { from: '54911@s.whatsapp.net', id: 'x', body: 'hi' },
      }),
    ).toBeNull()
  })

  it('returns null when webhook has no usable message content', () => {
    expect(extractInboundEvent({ event: 'connection.update', payload: {} })).toBeNull()
  })
})
