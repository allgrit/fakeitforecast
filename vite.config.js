import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/utils/**/*.js', 'src/components/**/*.jsx', 'src/pages/**/*.jsx'],
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 70,
        statements: 75,
        'src/utils/**/*.js': {
          lines: 90,
          statements: 90,
          branches: 90,
          functions: 95
        }
      }
    }
  }
})
