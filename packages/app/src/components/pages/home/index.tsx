import { FC } from 'react'
import { useAprOracle2 } from '../../../hooks/useAprOracle'

import VaultQueryCard from './VaultQueryCard'
// import { TokenPricesTest } from './TokenPricesTest'

export const Home: FC = () => {
  const thingy = useAprOracle2({
    vaultAddress: '0xBb287E6017d3DEb0e2E65061e8684eab21060123', // Example vault address
    delta: 100n, // Example delta value
  })

  return (
    <div className="flex flex-col items-center justify-start pt-12">
      {/* <TokenPricesTest /> */}
      <VaultQueryCard />
    </div>
  )
}
