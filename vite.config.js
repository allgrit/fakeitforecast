import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function resolveBase(command) {
  if (command !== 'build') {
    return '/'
  }

  const repository = process.env.GITHUB_REPOSITORY || ''
  const repoName = repository.split('/')[1]

  if (!repoName) {
    return '/'
  }

  return `/${repoName}/`
}

export default defineConfig(({ command }) => ({
  // Use an absolute subpath on GitHub Pages to avoid broken asset URLs when
  // the site is opened without a trailing slash (e.g. /repo instead of /repo/).
  base: resolveBase(command),
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
}))
