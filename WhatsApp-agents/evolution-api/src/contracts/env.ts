//Mariano Montini ('bosque', 'bosquestudio')
import { z } from 'zod'

// Optional webhook secret - empty string treated as unset (open webhook).
const optionalSecretSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}, z.string().min(1).optional())

// Env field schema - Evolution credentials, port, coupon URL, humanize delay overrides.
export const envSchema = z
  .object({
    EVOLUTION_API_URL: z.string().url('EVOLUTION_API_URL must be a valid URL'),
    EVOLUTION_API_KEY: z.string().min(1, 'EVOLUTION_API_KEY is required'),
    EVOLUTION_INSTANCE: z.string().min(1, 'EVOLUTION_INSTANCE is required'),
    PORT: z.coerce.number().int().positive().default(3001),
    COUPON_MEDIA_URL: z
      .string()
      .url()
      .default('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    EVOLUTION_API_VERSION: z.string().default('v2'),
    EVOLUTION_WEBHOOK_SECRET: optionalSecretSchema,
    NODE_ENV: z.string().optional(),
    HUMANIZE_MIN_MS: z.coerce.number().int().nonnegative().default(20_000),
    HUMANIZE_MAX_MS: z.coerce.number().int().nonnegative().default(45_000),
  })
  .superRefine((data, ctx) => {
    if (data.HUMANIZE_MAX_MS < data.HUMANIZE_MIN_MS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['HUMANIZE_MAX_MS'],
        message: 'HUMANIZE_MAX_MS must be >= HUMANIZE_MIN_MS',
      })
    }

    // Production delay floor - refuse 0 ms bypass when NODE_ENV is production.
    if (data.NODE_ENV === 'production') {
      if (data.HUMANIZE_MIN_MS < 20_000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['HUMANIZE_MIN_MS'],
          message: 'HUMANIZE_MIN_MS must be >= 20000 when NODE_ENV is production',
        })
      }
      if (data.HUMANIZE_MAX_MS < 45_000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['HUMANIZE_MAX_MS'],
          message: 'HUMANIZE_MAX_MS must be >= 45000 when NODE_ENV is production',
        })
      }
    }
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
