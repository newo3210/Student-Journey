//Mariano Montini ('bosque', 'bosquestudio')
import { extractInboundEvent } from '../contracts/webhook.js'
import type { MetaGraphClient } from '../infrastructure/metaGraphClient.js'
import { bindRecipient, resolveDemoAction } from './demoFlow.js'

// Inbound handler deps - Graph client and coupon media URL from config.
export type InboundHandlerDeps = {
  graphClient: MetaGraphClient
  couponMediaUrl: string
}

// Handle result - whether an outbound send happened and how many payloads.
export type HandleInboundResult = {
  handled: boolean
  sent: number
}

// Handle inbound webhook - parses Meta POST body and sends demo-flow replies.
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
    { couponMediaUrl: deps.couponMediaUrl },
  )

  const payloads = bindRecipient(action.payloads, event.from)
  let sent = 0

  // Graph send loop - only 2xx responses count toward successful `sent`.
  for (const payload of payloads) {
    const result = await deps.graphClient.sendMessage(payload)
    if (result.status >= 200 && result.status < 300) {
      sent += 1
    } else {
      console.error('Graph send failed (non-2xx)', {
        status: result.status,
        body: result.body,
        type: payload.type,
        to: payload.to,
      })
    }
  }

  return { handled: true, sent }
}
