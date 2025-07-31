import { SupportedChain, getSupportedChain, supportedChains } from '@/config/supportedChains'
import { createChainsContext } from '@/context/ChainsContext'
import { FC, PropsWithChildren, useMemo } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, type Chain } from 'wagmi/chains'

// !INJECTED
export const DEFAULT_CHAIN = mainnet.id

export const chainsContext = createChainsContext<(typeof supportedChains)[number]['id']>()

export const ChainsProvider: FC<PropsWithChildren> = ({ children }) => {
  const chainId = useChainId()
  const account = useAccount()

  const uncheckedChainId = account.chain?.id || DEFAULT_CHAIN

  const switchNetworkReturnValue = useSwitchChain()

  const isConnected = !!account

  const contextValue = useMemo(() => {
    const { switchChain } = switchNetworkReturnValue

    const active = getSupportedChain(chainId)

    const isConnectedChainValid = !!(account.chain?.id && getSupportedChain(account.chain.id))

    const isConnectedToNetwork = (chain: Chain | number) => {
      return typeof chain === 'number'
        ? getSupportedChain(chain as number)?.id === uncheckedChainId
        : chain.id === uncheckedChainId
    }

    const isMainnet = uncheckedChainId === DEFAULT_CHAIN

    return {
      chains: supportedChains as unknown as Chain[],
      active,
      chainId: chainId as SupportedChain,
      getChainFromId: getSupportedChain,
      switchNetwork: (chainId?: number) => {
        chainId && switchChain({ chainId })
      },
      isConnectedToNetwork,
      isConnectedChainValid,
      isMainnet,
      isConnected,
    }
  }, [chainId, switchNetworkReturnValue, isConnected])

  return <chainsContext.Provider value={contextValue}>{children}</chainsContext.Provider>
}
