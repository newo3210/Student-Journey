//Mariano Montini ('bosque', 'bosquestudio')
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { SignJWT, jwtVerify } from "jose";
import { verifyMessage } from "viem";
import {
  ethAddressSchema,
  extractChallengeJwtFromMessage,
  loginBodySchema,
  walletFromPayload,
} from "../src/contracts/web3Auth";

// Auth stub options - JWT secret for challenge and session tokens.
type AuthStubOptions = {
  jwtSecret: string;
};

const SESSION_COOKIE = "web3_login_eth_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24;

// Read raw POST body from Node IncomingMessage.
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// Parse Cookie header into a simple map.
function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

// JSON response helper for Node ServerResponse.
function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers?: Record<string, string>,
) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  if (headers) {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  }
  res.end(payload);
}

/**
 * Vite plugin - pedagogical SIWE auth stub for web3-login-ETH.
 * GET  /api/auth/challenge?address=
 * POST /api/auth/login
 * GET  /api/auth/session
 * POST /api/auth/logout
 */
export function authStubPlugin(opts: AuthStubOptions): Plugin {
  const secret = new TextEncoder().encode(opts.jwtSecret || "missing-secret");

  return {
    name: "web3-login-eth-auth-stub",
    configureServer(server) {
      if (!opts.jwtSecret) {
        console.warn(
          "[web3-login-ETH] JWT_SECRET is empty — set it in .env for real SIWE demos.",
        );
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? new URL(req.url, "http://localhost") : null;
        if (!url || !url.pathname.startsWith("/api/auth/")) return next();

        try {
          // Challenge - short-lived JWT embedded in sign-in message.
          if (req.method === "GET" && url.pathname === "/api/auth/challenge") {
            const address = url.searchParams.get("address")?.trim() ?? "";
            const parsed = ethAddressSchema.safeParse(address);
            if (!parsed.success) {
              return sendJson(res, 400, { error: "invalid address" });
            }

            const challengeJwt = await new SignJWT({
              purpose: "web3-login-eth",
              adr: address.toLowerCase(),
            })
              .setProtectedHeader({ alg: "HS256" })
              .setExpirationTime("5m")
              .setJti(crypto.randomUUID())
              .sign(secret);

            const message = [
              "web3-login-ETH — Open session (24 h)",
              "",
              `Wallet: ${address}`,
              `Chain: Base (8453)`,
              "",
              `Challenge: ${challengeJwt}`,
              "",
              "Sign this message to prove wallet ownership for an HTTP session.",
              "This does not spend funds or transfer tokens.",
            ].join("\n");

            return sendJson(res, 200, { configured: true, message });
          }

          // Login - verify signature + challenge, set session cookie.
          if (req.method === "POST" && url.pathname === "/api/auth/login") {
            const raw = await readBody(req);
            let json: unknown;
            try {
              json = JSON.parse(raw);
            } catch {
              return sendJson(res, 400, { error: "invalid JSON" });
            }

            const body = loginBodySchema.safeParse(json);
            if (!body.success) {
              return sendJson(res, 400, {
                error: "address, message and signature required",
              });
            }

            const { address, message, signature } = body.data;
            const challengeJwt = extractChallengeJwtFromMessage(message);
            if (!challengeJwt) {
              return sendJson(res, 400, { error: "challenge missing in message" });
            }

            let adr = "";
            try {
              const { payload } = await jwtVerify(challengeJwt, secret, {
                algorithms: ["HS256"],
              });
              if ((payload as Record<string, unknown>).purpose !== "web3-login-eth") {
                return sendJson(res, 401, { error: "invalid challenge" });
              }
              adr = String((payload as Record<string, unknown>).adr ?? "").toLowerCase();
            } catch {
              return sendJson(res, 401, { error: "challenge invalid or expired" });
            }

            if (adr !== address.toLowerCase()) {
              return sendJson(res, 401, { error: "challenge address mismatch" });
            }

            const validSig = await verifyMessage({
              address: address as `0x${string}`,
              message,
              signature: signature as `0x${string}`,
            });
            if (!validSig) {
              return sendJson(res, 401, { error: "invalid signature" });
            }

            const w = address.toLowerCase();
            const access_token = await new SignJWT({
              role: "authenticated",
              app_metadata: { wallet: w },
              wallet: w,
            })
              .setProtectedHeader({ alg: "HS256" })
              .setSubject(w)
              .setAudience("authenticated")
              .setIssuedAt()
              .setExpirationTime("24h")
              .sign(secret);

            const cookie = [
              `${SESSION_COOKIE}=${encodeURIComponent(access_token)}`,
              "Path=/",
              "HttpOnly",
              "SameSite=Lax",
              `Max-Age=${SESSION_MAX_AGE_SEC}`,
            ].join("; ");

            return sendJson(
              res,
              200,
              { ok: true, access_token, wallet: w, expires_in: SESSION_MAX_AGE_SEC },
              { "Set-Cookie": cookie },
            );
          }

          // Session - return wallet if cookie JWT is valid.
          if (req.method === "GET" && url.pathname === "/api/auth/session") {
            const cookies = parseCookies(req.headers.cookie);
            const token = cookies[SESSION_COOKIE];
            if (!token) {
              return sendJson(res, 200, { ok: false });
            }
            try {
              const { payload } = await jwtVerify(token, secret, {
                algorithms: ["HS256"],
                audience: "authenticated",
              });
              const wallet = walletFromPayload(payload as Record<string, unknown>);
              if (!wallet) return sendJson(res, 200, { ok: false });
              return sendJson(res, 200, { ok: true, wallet, access_token: token });
            } catch {
              return sendJson(res, 200, { ok: false });
            }
          }

          // Logout - clear cookie.
          if (req.method === "POST" && url.pathname === "/api/auth/logout") {
            const cookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
            return sendJson(res, 200, { ok: true }, { "Set-Cookie": cookie });
          }

          return sendJson(res, 404, { error: "not found" });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "auth stub error";
          return sendJson(res, 500, { error: msg });
        }
      });
    },
  };
}
