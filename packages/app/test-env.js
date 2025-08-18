// Test script to verify environment variables are loaded correctly
import { loadEnv } from 'vite'
import path from 'node:path'
import fs from 'node:fs'

const mode = 'development'

console.log('Current directory:', process.cwd())
console.log('__dirname:', path.dirname(new URL(import.meta.url).pathname))

const rootPath = path.resolve('../..')
console.log('Root path:', rootPath)
console.log(
  'Checking .env file exists:',
  fs.existsSync(path.join(rootPath, '.env'))
)

const env = loadEnv(mode, rootPath, '')

console.log('Environment variables loaded:')
console.log('RPC_URI_FOR_1:', env.RPC_URI_FOR_1)
console.log('RPC_URI_FOR_10:', env.RPC_URI_FOR_10)
console.log('RPC_URI_FOR_100:', env.RPC_URI_FOR_100)
console.log('RPC_URI_FOR_137:', env.RPC_URI_FOR_137)
console.log('RPC_URI_FOR_146:', env.RPC_URI_FOR_146)
console.log('RPC_URI_FOR_8453:', env.RPC_URI_FOR_8453)
console.log('RPC_URI_FOR_42161:', env.RPC_URI_FOR_42161)
console.log('WALLETCONNECT_PROJECT_ID:', env.WALLETCONNECT_PROJECT_ID)

// Let's also try loading with different prefixes
const envWithPrefix = loadEnv(mode, rootPath, 'RPC_')
console.log('\nWith RPC_ prefix:', envWithPrefix)

const envAll = loadEnv(mode, rootPath, ['VITE_', 'RPC_', 'WALLETCONNECT_'])
console.log('\nWith multiple prefixes:', envAll)

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

console.log('\nConverted to VITE_ prefix:')
console.log(envWithVitePrefix)
