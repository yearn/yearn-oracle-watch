import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

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
