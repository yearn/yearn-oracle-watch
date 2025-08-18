import { Address } from 'viem'

export function getSvgAsset(chainId: number, address: Address): string {
  return `https://cdn.jsdelivr.net/gh/yearn/tokenassets@main/tokens/${chainId}/${address.toLowerCase()}/logo-32.png`
}
