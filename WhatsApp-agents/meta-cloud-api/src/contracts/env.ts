//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Env field schema - required Meta credentials plus optional Graph version and media URL.
export const envSchema = z.object({
  WHATSAPP_TOKEN: z.string().min(1, 'WHATSAPP_TOKEN is required'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1, 'WHATSAPP_PHONE_NUMBER_ID is required'),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1, 'WHATSAPP_VERIFY_TOKEN is required'),
  WHATSAPP_APP_SECRET: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  META_GRAPH_API_VERSION: z.string().default('v21.0'),
  COUPON_MEDIA_URL: z
    .string()
    .url()
    .default('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
})

// Parsed env type - validated configuration used across layers.
export type AppEnv = z.infer<typeof envSchema>

// Env parse result - either validated config or a clear missing-keys error.
export type EnvParseResult =
  | { ok: true; env: AppEnv }
  | { ok: false; error: string }

// Parse process env - fails fast listing missing/invalid keys for startup.
export function parseEnv(raw: NodeJS.ProcessEnv = process.env): EnvParseResult {
  const result = envSchema.safeParse(raw)
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    return { ok: false, error: `Invalid environment configuration: ${details}` }
  }
  return { ok: true, env: result.data }
}
