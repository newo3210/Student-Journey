//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { DEMO_BUTTON_IDS, bindRecipient, resolveDemoAction } from './demoFlow.js'

const couponUrl = 'https://example.com/coupon.pdf'

describe('demoFlow', () => {
  it('opens text fallback menu for menu keywords by default', () => {
    const action = resolveDemoAction({ type: 'text', textBody: 'menu' }, { couponMediaUrl: couponUrl })
    expect(action.messages).toHaveLength(1)
    expect(action.messages[0]?.kind).toBe('text')
    if (action.messages[0]?.kind === 'text') {
      expect(action.messages[0].text).toMatch(/1\) Info/)
    }
  })

  it('opens interactive buttons menu when menuMode is buttons', () => {
    const action = resolveDemoAction(
      { type: 'text', textBody: 'menu' },
      { couponMediaUrl: couponUrl, menuMode: 'buttons' },
    )
    expect(action.messages[0]?.kind).toBe('buttons')
  })

  it('sends document coupon for coupon keyword', () => {
    const action = resolveDemoAction({ type: 'text', textBody: 'coupon' }, { couponMediaUrl: couponUrl })
    expect(action.messages[0]?.kind).toBe('media')
    if (action.messages[0]?.kind === 'media') {
      expect(action.messages[0].media).toBe(couponUrl)
      expect(action.messages[0].mediatype).toBe('document')
    }
  })

  it('handles interactive coupon button with text then media', () => {
    const action = resolveDemoAction(
      { type: 'interactive', interactiveId: DEMO_BUTTON_IDS.coupon },
      { couponMediaUrl: couponUrl },
    )
    expect(action.messages).toHaveLength(2)
    expect(action.messages[0]?.kind).toBe('text')
    expect(action.messages[1]?.kind).toBe('media')
  })

  it('handles interactive info with deterministic text', () => {
    const action = resolveDemoAction(
      { type: 'interactive', interactiveId: DEMO_BUTTON_IDS.info },
      { couponMediaUrl: couponUrl },
    )
    expect(action.messages[0]?.kind).toBe('text')
    if (action.messages[0]?.kind === 'text') {
      expect(action.messages[0].text).toContain('Level 1')
    }
  })

  it('binds recipient on all messages', () => {
    const action = resolveDemoAction({ type: 'text', textBody: 'menu' }, { couponMediaUrl: couponUrl })
    const bound = bindRecipient(action.messages, '549119999')
    expect(bound.every((m) => m.to === '549119999')).toBe(true)
  })

  it('does not open menu for inbound image type', () => {
    expect(resolveDemoAction({ type: 'image' }, { couponMediaUrl: couponUrl }).messages).toHaveLength(0)
  })

  it('does not open menu for inbound audio or sticker', () => {
    expect(resolveDemoAction({ type: 'audio' }, { couponMediaUrl: couponUrl }).messages).toHaveLength(0)
    expect(resolveDemoAction({ type: 'sticker' }, { couponMediaUrl: couponUrl }).messages).toHaveLength(0)
  })
})
