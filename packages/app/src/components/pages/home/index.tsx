import { FC } from 'react'

import VaultQueryCard from './VaultQueryCard'

export const Home: FC = () => {
  return (
    <div className="flex flex-col items-center justify-start pt-12">
      {/* <TokenPricesTest /> */}
      <VaultQueryCard />
    </div>
  )
}
