/// <reference types="vitest" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Load env file from the root directory (two levels up)
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '')

  // Convert RPC_URI_FOR_* to VITE_RPC_URI_FOR_* for compatibility with the wagmi config
  const envWithVitePrefix = {
    VITE_RPC_URI_FOR_1: env.RPC_URI_FOR_1,
    VITE_RPC_URI_FOR_10: env.RPC_URI_FOR_10,
    VITE_RPC_URI_FOR_100: env.RPC_URI_FOR_100,
    VITE_RPC_URI_FOR_137: env.RPC_URI_FOR_137,
    VITE_RPC_URI_FOR_146: env.RPC_URI_FOR_146,
    VITE_RPC_URI_FOR_8453: env.RPC_URI_FOR_8453,
    VITE_RPC_URI_FOR_42161: env.RPC_URI_FOR_42161,
    VITE_WALLETCONNECT_PROJECT_ID: env.WALLETCONNECT_PROJECT_ID,
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
      tsconfigPaths({
        root: __dirname,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // Use source files in test environment for better debugging
        '@yearn-oracle-watch/sdk': path.resolve(
          __dirname,
          '../sdk/src/index.ts'
        ),
        '@yearn-oracle-watch/contracts': path.resolve(
          __dirname,
          '../contracts/src/wagmi.ts'
        ),
      },
    },
    define: {
      global: 'globalThis',
      // Make environment variables available to the test code
      'import.meta.env.VITE_RPC_URI_FOR_1': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_1
      ),
      'import.meta.env.VITE_RPC_URI_FOR_10': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_10
      ),
      'import.meta.env.VITE_RPC_URI_FOR_100': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_100
      ),
      'import.meta.env.VITE_RPC_URI_FOR_137': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_137
      ),
      'import.meta.env.VITE_RPC_URI_FOR_146': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_146
      ),
      'import.meta.env.VITE_RPC_URI_FOR_8453': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_8453
      ),
      'import.meta.env.VITE_RPC_URI_FOR_42161': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_42161
      ),
      'import.meta.env.VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(
        envWithVitePrefix.VITE_WALLETCONNECT_PROJECT_ID
      ),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      css: true,
      // Test file patterns
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        'node_modules',
        'dist',
        'build',
        '.next',
        '.nuxt',
        '.vercel',
        '.swc',
      ],
      // Timeouts for blockchain operations
      testTimeout: 60000, // Increased for blockchain calls
      hookTimeout: 30000,
      // Reporter configuration
      reporter: ['verbose', 'json'],
      outputFile: {
        json: './test-results.json',
      },
      // Coverage configuration (optional)
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/tests/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**',
        ],
      },
    },
  }
})
