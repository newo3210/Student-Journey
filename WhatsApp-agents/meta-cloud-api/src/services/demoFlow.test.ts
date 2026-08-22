//Mariano Montini ('bosque', 'bosquestudio')
import { describe, expect, it } from 'vitest'
import { DEMO_BUTTON_IDS, bindRecipient, resolveDemoAction } from '../services/demoFlow.js'

const couponUrl = 'https://example.com/coupon.pdf'

describe('demoFlow', () => {
  // Menu keyword - hi opens interactive buttons menu.
  it('opens interactive menu for menu keywords', () => {
    const action = resolveDemoAction({ type: 'text', textBody: 'menu' }, { couponMediaUrl: couponUrl })
    expect(action.payloads).toHaveLength(1)
    expect(action.payloads[0]?.type).toBe('interactive')
  })

  // Coupon keyword - sends document media payload.
  it('sends document coupon for coupon keyword', () => {
    const action = resolveDemoAction({ type: 'text', textBody: 'coupon' }, { couponMediaUrl: couponUrl })
    expect(action.payloads[0]?.type).toBe('document')
    expect(action.payloads[0]?.document?.link).toBe(couponUrl)
  })

  // Interactive coupon button - text ack plus document follow-up.
  it('handles interactive coupon button with text then media', () => {
    const action = resolveDemoAction(
      { type: 'interactive', interactiveId: DEMO_BUTTON_IDS.coupon },
      { couponMediaUrl: couponUrl },
    )
    expect(action.payloads).toHaveLength(2)
    expect(action.payloads[0]?.type).toBe('text')
    expect(action.payloads[1]?.type).toBe('document')
  })

  // Interactive info - deterministic text reply.
  it('handles interactive info with deterministic text', () => {
    const action = resolveDemoAction(
      { type: 'interactive', interactiveId: DEMO_BUTTON_IDS.info },
      { couponMediaUrl: couponUrl },
    )
    expect(action.payloads[0]?.type).toBe('text')
    expect(action.payloads[0]?.text?.body).toContain('Level 1')
  })

  // Bind recipient - replaces placeholder to with real WhatsApp id.
  it('binds recipient on all payloads', () => {
    const action = resolveDemoAction({ type: 'text', textBody: 'menu' }, { couponMediaUrl: couponUrl })
    const bound = bindRecipient(action.payloads, '549119999')
    expect(bound.every((p) => p.to === '549119999')).toBe(true)
  })

  // Non-text inbound - image/audio/sticker must not open the interactive menu.
  it('does not open menu for inbound image type', () => {
    const action = resolveDemoAction({ type: 'image' }, { couponMediaUrl: couponUrl })
    expect(action.payloads).toHaveLength(0)
  })

  it('does not open menu for inbound audio or sticker', () => {
    expect(resolveDemoAction({ type: 'audio' }, { couponMediaUrl: couponUrl }).payloads).toHaveLength(0)
    expect(resolveDemoAction({ type: 'sticker' }, { couponMediaUrl: couponUrl }).payloads).toHaveLength(0)
  })
})
