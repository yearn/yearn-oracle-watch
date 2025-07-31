import { Address } from 'viem'

export function getSvgAsset(chainId: number, address: Address): string {
  return `https://token-assets-one.vercel.app/api/tokens/${chainId}/${address}/logo.svg`
}
