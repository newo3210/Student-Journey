//Mariano Montini ('bosque', 'bosquestudio')
import 'dotenv/config'
import { createApp } from './app.js'
import { setAppEnv } from './config.js'
import { parseEnv } from './contracts/env.js'
import { BaileysClient } from './infrastructure/baileysAdapter.js'
import { asBaileysAdapterSocket, createLiveBaileysSocket } from './infrastructure/createLiveSocket.js'
import { wireLiveBaileysEvents } from './infrastructure/wireLiveBaileysEvents.js'
import { handleInboundWebhook } from './services/inboundHandler.js'

// Bootstrap - validate env, live socket (QR + upsert), HTTP simulator, listen.
async function main(): Promise<void> {
  const parsed = parseEnv(process.env)
  if (!parsed.ok) {
    console.error(parsed.error)
    process.exit(1)
  }

  setAppEnv(parsed.env)

  const sock = await createLiveBaileysSocket({ authDir: parsed.env.BAILEYS_AUTH_DIR })
  const baileysClient = new BaileysClient({ sock: asBaileysAdapterSocket(sock) })

  wireLiveBaileysEvents(sock, {
    onInbound: (body) =>
      handleInboundWebhook(body, {
        baileysClient,
        couponMediaUrl: parsed.env.COUPON_MEDIA_URL,
        minDelayMs: parsed.env.HUMANIZE_MIN_MS,
        maxDelayMs: parsed.env.HUMANIZE_MAX_MS,
        menuMode: parsed.env.BAILEYS_MENU_MODE,
      }),
  })

  const app = createApp({ env: parsed.env, baileysClient })
  const port = parsed.env.PORT

  app.listen(port, () => {
    console.log(`baileys-agent listening on http://localhost:${port}`)
    console.log(
      'Live inbound: Baileys messages.upsert → demo handler. HTTP POST /webhook remains a TDD simulator (fromMe must be false).',
    )
    console.log(`Auth dir: ${parsed.env.BAILEYS_AUTH_DIR} (gitignored; scan the pairing QR printed in this terminal)`)
    console.log(
      `Humanize delay: ${parsed.env.HUMANIZE_MIN_MS}-${parsed.env.HUMANIZE_MAX_MS}ms (composing → delay → send)`,
    )
    console.log(`Menu mode: ${parsed.env.BAILEYS_MENU_MODE} (native buttons are unstable)`)
    if (!parsed.env.BAILEYS_WEBHOOK_SECRET) {
      console.warn(
        'BAILEYS_WEBHOOK_SECRET is unset: POST /webhook is unsigned. A public tunnel is a send-oracle.',
      )
    }
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
