//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { extractInboundEvent, normalizeRemoteJid } from './webhook.js'

// Sample text webhook - Evolution messages.upsert with conversation body.
function textWebhook(body: string) {
  return {
    event: 'messages.upsert',
    instance: 'student-demo',
    data: {
      key: { remoteJid: '5491112345678@s.whatsapp.net', fromMe: false, id: 'EVO.TEXT1' },
      messageType: 'conversation',
      message: { conversation: body },
    },
  }
}

describe('normalizeRemoteJid', () => {
  it('strips @s.whatsapp.net suffix', () => {
    expect(normalizeRemoteJid('54911@s.whatsapp.net')).toBe('54911')
  })
})

describe('extractInboundEvent', () => {
  it('extracts inbound text fields from Evolution webhook body', () => {
    expect(extractInboundEvent(textWebhook('hello'))).toEqual({
      from: '5491112345678',
      messageId: 'EVO.TEXT1',
      type: 'text',
      textBody: 'hello',
      interactiveId: undefined,
      interactiveTitle: undefined,
    })
  })

  it('extracts interactive button reply id and title', () => {
    const event = extractInboundEvent({
      event: 'messages.upsert',
      data: {
        key: { remoteJid: '5491112345678@s.whatsapp.net', fromMe: false, id: 'EVO.BTN1' },
        messageType: 'buttonsResponseMessage',
        message: {
          buttonsResponseMessage: {
            selectedButtonId: 'menu_coupon',
            selectedDisplayText: 'Coupon PDF',
          },
        },
      },
    })
    expect(event?.type).toBe('interactive')
    expect(event?.interactiveId).toBe('menu_coupon')
    expect(event?.interactiveTitle).toBe('Coupon PDF')
  })

  it('extracts list reply selected row id', () => {
    const event = extractInboundEvent({
      data: {
        key: { remoteJid: '54911@s.whatsapp.net', fromMe: false, id: 'EVO.LIST1' },
        message: {
          listResponseMessage: {
            title: 'Info',
            singleSelectReply: { selectedRowId: 'menu_info' },
          },
        },
      },
    })
    expect(event?.interactiveId).toBe('menu_info')
    expect(event?.type).toBe('interactive')
  })

  it('returns null when fromMe is true', () => {
    expect(
      extractInboundEvent({
        data: {
          key: { remoteJid: '54911@s.whatsapp.net', fromMe: true, id: 'x' },
          message: { conversation: 'hi' },
        },
      }),
    ).toBeNull()
  })

  it('returns null when fromMe is omitted', () => {
    expect(
      extractInboundEvent({
        data: {
          key: { remoteJid: '54911@s.whatsapp.net', id: 'x' },
          message: { conversation: 'hi' },
        },
      }),
    ).toBeNull()
  })

  it('returns null when webhook has no usable message content', () => {
    expect(extractInboundEvent({ event: 'connection.update', data: {} })).toBeNull()
  })
})
