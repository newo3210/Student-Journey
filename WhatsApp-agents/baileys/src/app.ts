//Mariano Montini ('bosque', 'bosquestudio')
import express, { type Express } from 'express'
import type { AppEnv } from './contracts/env.js'
import { BaileysClient } from './infrastructure/baileysAdapter.js'
import type { RequestWithRawBody } from './presentation/httpTypes.js'
import { createWebhookRouter } from './presentation/webhookRoutes.js'
import type { SleepFn } from './services/humanizedDispatch.js'

// App factory options - env and optional adapter / sleep overrides for tests.
export type CreateAppOptions = {
  env: AppEnv
  baileysClient: BaileysClient
  sleep?: SleepFn
}

// Create Express app - JSON parsing plus simulator webhook routes.
export function createApp(options: CreateAppOptions): Express {
  const app = express()

  // JSON body parser - stores raw Buffer on req for optional future signature checks.
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        ;(req as RequestWithRawBody).rawBody = Buffer.from(buf)
      },
    }),
  )

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  app.use(
    '/webhook',
    createWebhookRouter({
      env: options.env,
      baileysClient: options.baileysClient,
      sleep: options.sleep,
    }),
  )

  return app
}
