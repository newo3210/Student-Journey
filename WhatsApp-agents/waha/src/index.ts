//Mariano Montini ('bosque', 'bosquestudio')
import 'dotenv/config'
import { createApp } from './app.js'
import { setAppEnv } from './config.js'
import { parseEnv } from './contracts/env.js'

// Bootstrap - validate env, create app, listen on configured port.
function main(): void {
  const parsed = parseEnv(process.env)
  if (!parsed.ok) {
    console.error(parsed.error)
    process.exit(1)
  }

  setAppEnv(parsed.env)
  const app = createApp({ env: parsed.env })
  const port = parsed.env.PORT

  app.listen(port, () => {
    console.log(`waha-agent listening on http://localhost:${port}`)
    console.log(`Webhook URL path: /webhook (Waha session ${parsed.env.WAHA_SESSION} via ${parsed.env.WAHA_API_URL})`)
    console.log(
      `Humanize delay: ${parsed.env.HUMANIZE_MIN_MS}-${parsed.env.HUMANIZE_MAX_MS}ms (presence → delay → send)`,
    )
    console.log(`Menu mode: ${parsed.env.WAHA_MENU_MODE}`)
    if (!parsed.env.WAHA_WEBHOOK_SECRET) {
      console.warn(
        'WAHA_WEBHOOK_SECRET is unset: POST /webhook is unsigned. A public tunnel is a send-oracle.',
      )
    }
  })
}

main()
