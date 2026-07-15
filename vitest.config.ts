import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node', // ou 'jsdom' selon besoin
    // resolve.tsconfigPaths: true
  }
})