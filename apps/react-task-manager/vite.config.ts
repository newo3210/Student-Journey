//Mariano Montini ('bosque', 'bosquestudio')
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite plugins - React transform and Tailwind CSS pipeline.
const plugins = [react(), tailwindcss()]

// Test config - jsdom environment, globals, and setup file.
const test = {
  environment: 'jsdom' as const,
  globals: true,
  setupFiles: './src/test/setup.ts',
}

// App tooling config - bundler plugins plus Vitest options.
export default defineConfig({
  plugins,
  test,
})
