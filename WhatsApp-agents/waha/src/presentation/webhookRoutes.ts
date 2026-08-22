//Mariano Montini ('bosque', 'bosquestudio')
import { timingSafeEqual } from 'node:crypto'
import { Router, type Request, type Response } from 'express'
import type { AppEnv } from '../contracts/env.js'
import type { WahaClient } from '../infrastructure/wahaClient.js'
import { handleInboundWebhook } from '../services/inboundHandler.js'
import type { SleepFn } from '../services/humanizedDispatch.js'

// Shared-secret compare - constant-time match of x-webhook-secret vs env.
function webhookSecretMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// Route deps - validated env, Waha client, optional sleep inject for tests.
export type WebhookRouteDeps = {
  env: AppEnv
  wahaClient: WahaClient
  sleep?: SleepFn
}

// Create webhook router - thin POST inbound handler (Waha has no Meta-style GET verify).
export function createWebhookRouter(deps: WebhookRouteDeps): Router {
  const router = Router()

  // POST inbound - optional shared secret, then ack, then services parse/handle.
  router.post('/', async (req: Request, res: Response) => {
    const configuredSecret = deps.env.WAHA_WEBHOOK_SECRET
    if (configuredSecret) {
      const headerSecret = req.header('x-webhook-secret')
      if (!headerSecret) {
        res.status(401).json({ error: 'unauthorized' })
        return
      }
      if (!webhookSecretMatches(headerSecret, configuredSecret)) {
        res.status(403).json({ error: 'forbidden' })
        return
      }
    }

    res.status(200).json({ status: 'received' })

    try {
      await handleInboundWebhook(req.body, {
        wahaClient: deps.wahaClient,
        couponMediaUrl: deps.env.COUPON_MEDIA_URL,
        minDelayMs: deps.env.HUMANIZE_MIN_MS,
        maxDelayMs: deps.env.HUMANIZE_MAX_MS,
        menuMode: deps.env.WAHA_MENU_MODE,
        sleep: deps.sleep,
      })
    } catch (error) {
      console.error('Inbound webhook handling failed', error)
    }
  })

  return router
}
