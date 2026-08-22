//Mariano Montini ('bosque', 'bosquestudio')
import express, { type Express } from 'express'
import type { AppEnv } from './contracts/env.js'
import { WahaClient } from './infrastructure/wahaClient.js'
import type { RequestWithRawBody } from './presentation/httpTypes.js'
import { createWebhookRouter } from './presentation/webhookRoutes.js'
import type { SleepFn } from './services/humanizedDispatch.js'

// App factory options - env and optional Waha client / sleep overrides for tests.
export type CreateAppOptions = {
  env: AppEnv
  wahaClient?: WahaClient
  sleep?: SleepFn
}

// Create Express app - JSON parsing plus webhook routes.
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

  const wahaClient =
    options.wahaClient ??
    new WahaClient({
      baseUrl: options.env.WAHA_API_URL,
      apiKey: options.env.WAHA_API_KEY,
      session: options.env.WAHA_SESSION,
    })

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  app.use(
    '/webhook',
    createWebhookRouter({
      env: options.env,
      wahaClient,
      sleep: options.sleep,
    }),
  )

  return app
}
