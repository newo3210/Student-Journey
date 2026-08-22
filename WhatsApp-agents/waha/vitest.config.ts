//Mariano Montini ('bosque', 'bosquestudio')
import { defineConfig } from 'vitest/config'

// Vitest config - Node environment for Express and Waha client unit tests.
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
  },
})
