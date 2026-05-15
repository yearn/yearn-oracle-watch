import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  // Load env file from workspace root
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '')

  // Convert RPC_URI_FOR_* to VITE_RPC_URI_FOR_* for compatibility with the wagmi config
  const envWithVitePrefix = {
    VITE_RPC_URI_FOR_1: env.RPC_URI_FOR_1,
    VITE_RPC_URI_FOR_10: env.RPC_URI_FOR_10,
    VITE_RPC_URI_FOR_100: env.RPC_URI_FOR_100,
    VITE_RPC_URI_FOR_137: env.RPC_URI_FOR_137,
    VITE_RPC_URI_FOR_146: env.RPC_URI_FOR_146,
    VITE_RPC_URI_FOR_8453: env.RPC_URI_FOR_8453,
    VITE_RPC_URI_FOR_42161: env.RPC_URI_FOR_42161,
    VITE_RPC_URI_FOR_747474: env.RPC_URI_FOR_747474,
    VITE_WALLETCONNECT_PROJECT_ID: env.WALLETCONNECT_PROJECT_ID,
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
      tsconfigPaths({
        // This ensures vite-tsconfig-paths uses the local tsconfig
        root: __dirname,
      }),
    ],
    optimizeDeps: {
      esbuildOptions: {
        jsx: 'automatic',
      },
      // Include workspace packages to be pre-bundled
      include: isDev ? [] : ['@yearn-oracle-watch/sdk', '@yearn-oracle-watch/contracts'],
      exclude: isDev ? ['@yearn-oracle-watch/sdk', '@yearn-oracle-watch/contracts'] : [],
    },
    define: {
      global: 'globalThis',
      // Define environment variables for the frontend
      'import.meta.env.VITE_RPC_URI_FOR_1': JSON.stringify(envWithVitePrefix.VITE_RPC_URI_FOR_1),
      'import.meta.env.VITE_RPC_URI_FOR_10': JSON.stringify(envWithVitePrefix.VITE_RPC_URI_FOR_10),
      'import.meta.env.VITE_RPC_URI_FOR_100': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_100,
      ),
      'import.meta.env.VITE_RPC_URI_FOR_137': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_137,
      ),
      'import.meta.env.VITE_RPC_URI_FOR_146': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_146,
      ),
      'import.meta.env.VITE_RPC_URI_FOR_8453': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_8453,
      ),
      'import.meta.env.VITE_RPC_URI_FOR_42161': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_42161,
      ),
      'import.meta.env.VITE_RPC_URI_FOR_747474': JSON.stringify(
        envWithVitePrefix.VITE_RPC_URI_FOR_747474,
      ),
      'import.meta.env.VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(
        envWithVitePrefix.VITE_WALLETCONNECT_PROJECT_ID,
      ),
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // In development, use source files directly
        // In production, Vite will use the package.json exports
        ...(isDev
          ? {
              '@yearn-oracle-watch/sdk': path.resolve(__dirname, '../sdk/src/index.ts'),
              '@yearn-oracle-watch/contracts': path.resolve(__dirname, '../contracts/src/wagmi.ts'),
            }
          : {}),
      },
      // This tells Vite to use the 'development' export condition in dev mode
      conditions: isDev ? ['development'] : [],
    },
  }
})
