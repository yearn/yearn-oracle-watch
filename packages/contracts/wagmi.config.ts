import { promises as fs } from 'node:fs'
import { Config, defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import 'dotenv/config'
import _ from 'lodash'
import { erc20Abi } from 'viem'
import manifest from './wagmiGenerateManifest.json'

const template = await Promise.all(
  manifest.template.map(
    async ({
      name,
      address = undefined,
      chainId = 1,
    }: { name: string; address?: string; chainId?: number }) => {
      const file = await fs.readFile(`./src/abis/${name}.json`, 'utf8')
      return { abi: JSON.parse(file), name, address, chainId }
    },
  ),
)

const verified = await Promise.all(
  manifest.verified.map(async ({ name, address }) => {
    const file = await fs.readFile(`./src/abis/${name}.json`, 'utf8')
    return Object.entries(address).map(([chainId, addr]) => ({
      abi: JSON.parse(file),
      name,
      address: String(addr),
      chainId: Number(chainId),
    }))
  }),
).then(_.flatten)

const erc20 = await Promise.all(
  manifest.erc20.map(async ({ name, address }) => {
    return Object.entries(address).map(([chainId, addr]) => ({
      abi: erc20Abi,
      name,
      address: String(addr),
      chainId: Number(chainId),
    }))
  }),
).then(_.flatten)

const allContracts = _.chain(template)
  .concat(verified)
  .concat(erc20)
  .groupBy('name')
  .map((contracts) => {
    const addresses = _.chain(contracts)
      .map((contract) => (contract?.address ? [contract.chainId, contract?.address] : undefined))
      .compact()
      .fromPairs()
      .value() as Record<number, `0x${string}`> | undefined
    return {
      name: contracts[0].name,
      abi: contracts[0].abi,
      address: _.isEmpty(addresses) ? undefined : addresses,
    }
  })
  .compact()
  .flatten()
  .map((contract) => {
    const funcNames = manifest.abiSelections[
      contract.name as keyof typeof manifest.abiSelections
    ] as null | string[]

    return {
      ...contract,
      abi: contract.abi.filter((item: { name: string; type: string }) => {
        if (item.type !== 'function') {
          return false
        }
        if (!funcNames) {
          return true
        }
        return funcNames.includes(item.name)
      }),
    }
  })
  .value()

const config: Config = {
  out: 'src/wagmi.ts',
  contracts: [
    {
      name: 'erc20',
      abi: erc20Abi,
    },
    ...allContracts,
  ],
  plugins: [
    react({
      getHookName: ({ contractName, type: _type, itemName }) => {
        // Backwards compatibility
        const type = _type === 'simulate' ? 'prepare' : _type === 'read' ? '' : _type

        const typePascalCase = _.startCase(_.toLower(type))
        const hookName: `use${string}` = `use${typePascalCase}${contractName}${itemName ?? ''}`
        if (type === 'watch') {
          return `${hookName}Event`
        }
        return hookName
      },
    }),
  ],
}

export default defineConfig(config) as ReturnType<typeof defineConfig>
