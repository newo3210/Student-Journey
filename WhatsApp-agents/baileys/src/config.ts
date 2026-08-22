//Mariano Montini ('bosque', 'bosquestudio')
import type { AppEnv } from './contracts/env.js'

// Config holder - validated env available after successful startup parse.
let cachedEnv: AppEnv | null = null

// Set app env - stores validated configuration for routes and services.
export function setAppEnv(env: AppEnv): void {
  cachedEnv = env
}

// Get app env - throws if startup validation did not run.
export function getAppEnv(): AppEnv {
  if (!cachedEnv) {
    throw new Error('Application environment is not initialized')
  }
  return cachedEnv
}
