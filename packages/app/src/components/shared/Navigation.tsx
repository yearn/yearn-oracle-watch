import { ConnectButton } from '@rainbow-me/rainbowkit'
import { YearnLogo } from './YearnLogo'

interface NavigationProps {
  showConnectButton?: boolean
}

export function Navigation({ showConnectButton = false }: NavigationProps) {
  return (
    <nav className="border-b border-white/5">
      <div className="container mx-auto px-4 py-3 ">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-6 flex-col sm:flex-row w-full sm:w-auto">
              <div className="flex flex-row justify-between w-full sm:w-auto">
                <YearnLogo width={22} height={27} color="white" />
                {showConnectButton && (
                  <div className="[&>button]:!bg-[#F6FC3B] [&>button]:!text-black [&>button]:!font-semibold [&>button]:!text-[11.25px] [&>button]:!py-2 [&>button]:!px-4 [&>button]:!rounded-3xl [&>button]:!h-auto [&>button]:hover:!bg-[#F6FC3B]/90 sm:hidden">
                    <ConnectButton chainStatus="icon" showBalance={false} />
                  </div>
                )}
              </div>
              <nav className="flex items-center gap-5 text-white text-xl font-bold">
                <span>APR Oracle</span>
              </nav>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <nav className="flex items-center gap-4 mr-6">
                <a
                  href="https://yearn.fi/v3"
                  className="text-white/80 text-sm hover:text-white transition-colors"
                >
                  Vaults
                </a>
                <a
                  href="https://docs.yearn.fi/"
                  className="text-white/80 text-sm hover:text-white transition-colors"
                >
                  Docs
                </a>
              </nav>
              {showConnectButton && (
                <div className="[&>button]:!bg-[#F6FC3B] [&>button]:!text-black [&>button]:!font-semibold [&>button]:!text-[11.25px] [&>button]:!py-2 [&>button]:!px-4 [&>button]:!rounded-3xl [&>button]:!h-auto [&>button]:hover:!bg-[#F6FC3B]/90">
                  <ConnectButton chainStatus="icon" showBalance={false} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
