//Mariano Montini ('bosque', 'bosquestudio')
import express, { type Express } from 'express'
import type { AppEnv } from './contracts/env.js'
import { MetaGraphClient } from './infrastructure/metaGraphClient.js'
import type { RequestWithRawBody } from './presentation/httpTypes.js'
import { createWebhookRouter } from './presentation/webhookRoutes.js'

// App factory options - env and optional Graph client override for tests.
export type CreateAppOptions = {
  env: AppEnv
  graphClient?: MetaGraphClient
}

// Create Express app - JSON parsing with raw-body capture plus webhook routes.
export function createApp(options: CreateAppOptions): Express {
  const app = express()

  // JSON body parser - stores raw Buffer on req for X-Hub-Signature-256 HMAC.
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        ;(req as RequestWithRawBody).rawBody = Buffer.from(buf)
      },
    }),
  )

  const graphClient =
    options.graphClient ??
    new MetaGraphClient({
      token: options.env.WHATSAPP_TOKEN,
      phoneNumberId: options.env.WHATSAPP_PHONE_NUMBER_ID,
      apiVersion: options.env.META_GRAPH_API_VERSION,
    })

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  app.use('/webhook', createWebhookRouter({ env: options.env, graphClient }))

  return app
}
