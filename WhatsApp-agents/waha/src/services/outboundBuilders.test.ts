//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import {
  buildInteractiveButtonsMessage,
  buildInteractiveListMessage,
  buildMediaMessage,
  buildTextMessage,
} from './outboundBuilders.js'

describe('outboundBuilders', () => {
  it('builds text outbound message', () => {
    expect(buildTextMessage({ to: '54911', body: 'Hello' })).toEqual({
      kind: 'text',
      to: '54911',
      text: 'Hello',
    })
  })

  it('builds interactive buttons outbound message', () => {
    const message = buildInteractiveButtonsMessage({
      to: '54911',
      headerText: 'Demo',
      bodyText: 'Pick one',
      footerText: 'Footer',
      buttons: [{ id: 'menu_info', title: 'Info' }],
    })
    expect(message.kind).toBe('buttons')
    if (message.kind === 'buttons') {
      expect(message.title).toBe('Demo')
      expect(message.buttons[0]).toEqual({ id: 'menu_info', displayText: 'Info' })
    }
  })

  it('builds interactive list outbound message', () => {
    const message = buildInteractiveListMessage({
      to: '54911',
      bodyText: 'Open list',
      buttonText: 'Options',
      sections: [{ title: 'Main', rows: [{ id: 'r1', title: 'Row 1' }] }],
    })
    expect(message.kind).toBe('list')
    if (message.kind === 'list') {
      expect(message.buttonText).toBe('Options')
      expect(message.sections[0]?.rows[0]?.id).toBe('r1')
    }
  })

  it('builds document media outbound message', () => {
    expect(
      buildMediaMessage({
        to: '54911',
        type: 'document',
        link: 'https://example.com/coupon.pdf',
        caption: 'Coupon',
        filename: 'coupon.pdf',
      }),
    ).toEqual({
      kind: 'media',
      to: '54911',
      mediatype: 'document',
      media: 'https://example.com/coupon.pdf',
      caption: 'Coupon',
      fileName: 'coupon.pdf',
    })
  })
})
