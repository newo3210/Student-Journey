//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import {
  buildInteractiveButtonsPayload,
  buildInteractiveListPayload,
  buildMediaPayload,
  buildTextPayload,
} from '../services/outboundBuilders.js'

describe('outboundBuilders', () => {
  // Text shape - messaging_product whatsapp and type text with body.
  it('builds outbound text payload shape', () => {
    const payload = buildTextPayload({ to: '54911', body: 'Hello' })
    expect(payload).toMatchObject({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '54911',
      type: 'text',
      text: { preview_url: false, body: 'Hello' },
    })
  })

  // Interactive buttons shape - reply buttons with ids and titles.
  it('builds interactive buttons payload shape', () => {
    const payload = buildInteractiveButtonsPayload({
      to: '54911',
      bodyText: 'Pick one',
      buttons: [
        { id: 'menu_info', title: 'Info' },
        { id: 'menu_coupon', title: 'Coupon PDF' },
      ],
    })
    expect(payload.type).toBe('interactive')
    expect(payload.interactive).toMatchObject({
      type: 'button',
      body: { text: 'Pick one' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'menu_info', title: 'Info' } },
          { type: 'reply', reply: { id: 'menu_coupon', title: 'Coupon PDF' } },
        ],
      },
    })
  })

  // Interactive list shape - sections and rows under list action.
  it('builds interactive list payload shape', () => {
    const payload = buildInteractiveListPayload({
      to: '54911',
      bodyText: 'Open list',
      buttonText: 'Options',
      sections: [
        {
          title: 'Demo',
          rows: [{ id: 'row_1', title: 'Row one', description: 'Desc' }],
        },
      ],
    })
    expect(payload.interactive).toMatchObject({
      type: 'list',
      action: {
        button: 'Options',
        sections: [
          {
            title: 'Demo',
            rows: [{ id: 'row_1', title: 'Row one', description: 'Desc' }],
          },
        ],
      },
    })
  })

  // Document media shape - link, caption, and filename for coupon PDF.
  it('builds document media payload for coupon PDF', () => {
    const payload = buildMediaPayload({
      to: '54911',
      type: 'document',
      link: 'https://example.com/coupon.pdf',
      caption: 'Coupon',
      filename: 'coupon.pdf',
    })
    expect(payload).toMatchObject({
      type: 'document',
      document: {
        link: 'https://example.com/coupon.pdf',
        caption: 'Coupon',
        filename: 'coupon.pdf',
      },
    })
  })

  // Image media shape - link and optional caption.
  it('builds image media payload', () => {
    const payload = buildMediaPayload({
      to: '54911',
      type: 'image',
      link: 'https://example.com/coupon.png',
      caption: 'Show this code',
    })
    expect(payload).toMatchObject({
      type: 'image',
      image: { link: 'https://example.com/coupon.png', caption: 'Show this code' },
    })
  })
})
