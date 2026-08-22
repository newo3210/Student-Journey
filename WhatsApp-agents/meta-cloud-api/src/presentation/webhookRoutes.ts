//Mariano Montini ('bosque', 'bosquestudio')
import { Router, type Request, type Response } from 'express'
import type { RequestWithRawBody } from './httpTypes.js'
import type { AppEnv } from '../contracts/env.js'
import { webhookVerifyQuerySchema } from '../contracts/webhook.js'
import type { MetaGraphClient } from '../infrastructure/metaGraphClient.js'
import { handleInboundWebhook } from '../services/inboundHandler.js'
import { verifyWebhookChallenge } from '../services/verifyWebhook.js'
import { validateHubSignature } from '../services/webhookSignature.js'

// Route deps - validated env and Graph client injected from app bootstrap.
export type WebhookRouteDeps = {
  env: AppEnv
  graphClient: MetaGraphClient
}

// Create webhook router - thin GET verify + POST inbound handlers.
export function createWebhookRouter(deps: WebhookRouteDeps): Router {
  const router = Router()

  // GET verify - completes Meta subscription challenge when token matches.
  router.get('/', (req: Request, res: Response) => {
    const query = webhookVerifyQuerySchema.safeParse(req.query)
    const mode = query.success ? query.data['hub.mode'] : String(req.query['hub.mode'] ?? '')
    const verifyToken = query.success
      ? query.data['hub.verify_token']
      : String(req.query['hub.verify_token'] ?? '')
    const challenge = query.success
      ? query.data['hub.challenge']
      : String(req.query['hub.challenge'] ?? '')

    const result = verifyWebhookChallenge({
      mode,
      verifyToken,
      challenge,
      expectedToken: deps.env.WHATSAPP_VERIFY_TOKEN,
    })

    if (!result.ok) {
      res.status(403).send(result.reason)
      return
    }

    res.status(200).type('text/plain').send(result.challenge)
  })

  // POST inbound - optional HMAC gate, then ack + demo replies via services.
  router.post('/', async (req: Request, res: Response) => {
    const appSecret = deps.env.WHATSAPP_APP_SECRET

    // Signature gate - when app secret is set, reject missing/invalid HMAC before Graph.
    if (appSecret) {
      const rawReq = req as RequestWithRawBody
      const signatureHeader = req.header('x-hub-signature-256') ?? undefined
      const sigResult = validateHubSignature(rawReq.rawBody, signatureHeader, appSecret)
      if (!sigResult.ok) {
        res.status(sigResult.status).json({ error: sigResult.reason })
        return
      }
    }

    res.status(200).json({ status: 'received' })

    try {
      await handleInboundWebhook(req.body, {
        graphClient: deps.graphClient,
        couponMediaUrl: deps.env.COUPON_MEDIA_URL,
      })
    } catch (error) {
      console.error('Inbound webhook handling failed', error)
    }
  })

  return router
}
