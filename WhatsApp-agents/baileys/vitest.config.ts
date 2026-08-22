//Mariano Montini ('bosque', 'bosquestudio')
import { defineConfig } from 'vitest/config'

// Vitest config - Node environment; fake Baileys adapter only (no live socket).
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
  },
})
