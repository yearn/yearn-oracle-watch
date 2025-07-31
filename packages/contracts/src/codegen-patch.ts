import { promises as fs } from 'node:fs'
import process from 'node:process'
import wagmiGenerateManifest from '../wagmiGenerateManifest.json'

// Strengthen address types post-"wagmi generate"
const main = async () => {
  const file = await fs.readFile('./src/wagmi.ts', 'utf8')

  let lines: string[] = [`import { type Address } from 'viem'`, ...file.split('\n')]

  // Strongly type addresses
  const addressPattern = /\s+\d+: '0x[0-9a-fA-F]{40}',/
  lines = lines.map((line) =>
    line.match(addressPattern) ? line.replace(`',`, `' as Address,`) : line,
  )

  // For templates, remove addresses completely (we should be able to supply any address)
  const templateVarNames = wagmiGenerateManifest.template.map((t: any) => t.name)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^\s*> & \{ chainId\?: keyof typeof (\w*)Address } = \{} as any,$/)
    if (!match) {
      continue
    }

    const [, varName] = match
    if (!templateVarNames.includes(varName)) {
      continue
    }

    // Remove the Omit<'address'> from the config
    lines[i - 1] = lines[i - 1]!.replace(`| 'address' `, '')

    // Remove the chainId line from the config
    lines[i] = '  >,'
  }

  const content = lines.join('\n')
  await fs.writeFile('./src/wagmi.ts', content, 'utf8')
}

const patchWagmiFile = async () => {
  try {
    console.log('✅ Wagmi file patched successfully')
  } catch (error) {
    console.warn('⚠️ Wagmi file not found, skipping patch')
  }
}

main()
  .then(() => {
    patchWagmiFile()
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
