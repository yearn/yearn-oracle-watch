import { FC } from 'react'

import VaultQueryCard from './VaultQueryCard'
// import { TokenPricesTest } from './TokenPricesTest'

export const Home: FC = () => {
  return (
    <div className="flex flex-col items-center justify-start pt-12">
      {/* <TokenPricesTest /> */}
      <VaultQueryCard />
    </div>
  )
}
