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
    console.log(`meta-cloud-api listening on http://localhost:${port}`)
    console.log(`Webhook URL path: /webhook (Graph API ${parsed.env.META_GRAPH_API_VERSION})`)
  })
}

main()
