//Mariano Montini ('bosque', 'bosquestudio')
import type { OutboundMessage } from '../contracts/outbound.js'
import type { BaileysClient, BaileysSendResult } from '../infrastructure/baileysAdapter.js'

// Sleep function - injectable delay used by humanized dispatch (tests inject no-op).
export type SleepFn = (ms: number) => Promise<void>

// Default sleep - wall-clock Promise delay (production path).
export const defaultSleep: SleepFn = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

// Humanizer config - delay range, Baileys adapter, optional sleep inject.
export type HumanizedDispatchConfig = {
  client: BaileysClient
  minDelayMs: number
  maxDelayMs: number
  sleep?: SleepFn
  random?: () => number
}

// Dispatch result - whether presence/send succeeded and chosen delay.
export type HumanizedDispatchResult = {
  presenceStatus: number
  sendStatus: number
  delayMs: number
  sendBody: unknown
}

// Pick delay - inclusive random integer between min and max (ms).
export function pickDelayMs(
  minDelayMs: number,
  maxDelayMs: number,
  random: () => number = Math.random,
): number {
  if (maxDelayMs <= minDelayMs) return minDelayMs
  return minDelayMs + Math.floor(random() * (maxDelayMs - minDelayMs + 1))
}

// Humanized dispatch - composing presence → stochastic delay → send. No Redis/BullMQ.
export async function humanizedDispatch(
  message: OutboundMessage,
  config: HumanizedDispatchConfig,
): Promise<HumanizedDispatchResult> {
  const sleep = config.sleep ?? defaultSleep
  const delayMs = pickDelayMs(config.minDelayMs, config.maxDelayMs, config.random ?? Math.random)

  const presence = await config.client.sendPresence(message.to, 'composing')
  await sleep(delayMs)
  const send = await config.client.sendMessage(message)

  return {
    presenceStatus: presence.status,
    sendStatus: send.status,
    delayMs,
    sendBody: send.body,
  }
}

// Humanized send loop - dispatches each outbound message through presence+delay.
export async function humanizedSendAll(
  messages: OutboundMessage[],
  config: HumanizedDispatchConfig,
): Promise<{ sent: number; results: HumanizedDispatchResult[] }> {
  const results: HumanizedDispatchResult[] = []
  let sent = 0

  for (const message of messages) {
    const result = await humanizedDispatch(message, config)
    results.push(result)
    if (result.sendStatus >= 200 && result.sendStatus < 300) {
      sent += 1
    } else {
      console.error('Baileys send failed (non-2xx)', {
        status: result.sendStatus,
        body: result.sendBody,
        kind: message.kind,
        to: message.to,
      })
    }
  }

  return { sent, results }
}

export type { BaileysSendResult }
