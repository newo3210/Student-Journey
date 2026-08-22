//Mariano Montini ('bosque', 'bosquestudio')
import { extractInboundEvent } from '../contracts/webhook.js'
import type { BaileysClient } from '../infrastructure/baileysAdapter.js'
import { bindRecipient, resolveDemoAction } from './demoFlow.js'
import { humanizedSendAll, type SleepFn } from './humanizedDispatch.js'

// Inbound handler deps - adapter, coupon URL, humanize range, optional sleep.
export type InboundHandlerDeps = {
  baileysClient: BaileysClient
  couponMediaUrl: string
  minDelayMs: number
  maxDelayMs: number
  menuMode?: 'text' | 'buttons' | 'list'
  sleep?: SleepFn
}

// Handle result - whether an outbound send happened and how many payloads.
export type HandleInboundResult = {
  handled: boolean
  sent: number
}

// Handle inbound webhook - parses simulator POST body and humanized-sends demo replies.
export async function handleInboundWebhook(
  body: unknown,
  deps: InboundHandlerDeps,
): Promise<HandleInboundResult> {
  const event = extractInboundEvent(body)
  if (!event) {
    return { handled: false, sent: 0 }
  }

  const action = resolveDemoAction(
    {
      type: event.type,
      textBody: event.textBody,
      interactiveId: event.interactiveId,
    },
    { couponMediaUrl: deps.couponMediaUrl, menuMode: deps.menuMode },
  )

  const messages = bindRecipient(action.messages, event.from)
  if (messages.length === 0) {
    return { handled: true, sent: 0 }
  }

  const { sent } = await humanizedSendAll(messages, {
    client: deps.baileysClient,
    minDelayMs: deps.minDelayMs,
    maxDelayMs: deps.maxDelayMs,
    sleep: deps.sleep,
  })

  return { handled: true, sent }
}
