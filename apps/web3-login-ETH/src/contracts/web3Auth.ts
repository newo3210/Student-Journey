//Mariano Montini ('bosque', 'bosquestudio')
import { z } from "zod";

// Ethereum address schema - 0x + 40 hex chars.
export const ethAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "invalid ethereum address");

export type EthAddress = z.infer<typeof ethAddressSchema>;

// Optional ERC-20 env config - absent address means native-only mode.
export const tokenEnvSchema = z.object({
  address: ethAddressSchema.optional(),
  symbol: z.string().trim().min(1).max(24).optional(),
  decimals: z.coerce.number().int().min(0).max(36).default(18),
});

export type TokenEnvConfig = z.infer<typeof tokenEnvSchema>;

// Auth login body - address + signed challenge message + signature.
export const loginBodySchema = z.object({
  address: ethAddressSchema,
  message: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

// Session response - ok flag plus optional wallet and access token.
export const sessionResponseSchema = z.object({
  ok: z.boolean(),
  wallet: z.string().optional(),
  access_token: z.string().optional(),
  error: z.string().optional(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

// Truncate address - pedagogical display helper for identity fallback.
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address || "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// Parse token env - maps Vite env strings into validated config.
export function parseTokenEnv(input: {
  address?: string;
  symbol?: string;
  decimals?: string;
}): TokenEnvConfig {
  const address = input.address?.trim();
  const symbol = input.symbol?.trim();
  return tokenEnvSchema.parse({
    address: address || undefined,
    symbol: symbol || undefined,
    decimals: input.decimals?.trim() || "18",
  });
}

// Extract challenge JWT - reads "Challenge: eyJ..." line from SIWE message.
export function extractChallengeJwtFromMessage(message: string): string | null {
  for (const line of message.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith("Challenge:")) {
      const rest = t.slice("Challenge:".length).trim();
      if (rest.startsWith("eyJ")) return rest;
    }
  }
  return null;
}

// Wallet from JWT payload - supports app_metadata.wallet, wallet, or sub.
export function walletFromPayload(
  payload: Record<string, unknown>,
): string | null {
  const meta = payload.app_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    typeof meta?.wallet === "string" ? meta.wallet.trim().toLowerCase() : "";
  if (fromMeta && /^0x[0-9a-f]{40}$/.test(fromMeta)) return fromMeta;
  const root = payload.wallet;
  const fromRoot = typeof root === "string" ? root.trim().toLowerCase() : "";
  if (fromRoot && /^0x[0-9a-f]{40}$/.test(fromRoot)) return fromRoot;
  const sub = typeof payload.sub === "string" ? payload.sub.trim().toLowerCase() : "";
  if (sub && /^0x[0-9a-f]{40}$/.test(sub)) return sub;
  return null;
}
