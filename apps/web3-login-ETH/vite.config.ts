//Mariano Montini ('bosque', 'bosquestudio')
/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { authStubPlugin } from "./server/authPlugin";

// ESM dirname - resolve server plugin and project root on Windows.
const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Test-mode JWT - allows vitest without a real .env secret.
const VITEST_JWT_SECRET = "vitest-only-jwt-secret-not-for-production";

// Resolve JWT secret - fail loud in development; allow test fallback.
function resolveJwtSecret(mode: string, envSecret: string | undefined): string {
  const jwtSecret = envSecret?.trim() ?? "";
  const isTest = mode === "test" || Boolean(process.env.VITEST);

  if (jwtSecret) return jwtSecret;
  if (isTest) return VITEST_JWT_SECRET;
  if (mode === "development") {
    throw new Error(
      "[web3-login-ETH] JWT_SECRET is missing or empty. Set it in .env before running npm run dev.",
    );
  }
  return "";
}

// Vite config - React, Tailwind, SIWE auth stub, Vitest.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  const jwtSecret = resolveJwtSecret(mode, env.JWT_SECRET);

  return {
    plugins: [
      react(),
      tailwindcss(),
      authStubPlugin({ jwtSecret }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
    },
  };
});
