import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Navigation() {
  return (
    <nav className="border-b border-white/5">
      <div className="container mx-auto px-4 py-3 ">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-6 flex-col sm:flex-row w-full sm:w-auto">
              <div className="flex flex-row justify-between w-full sm:w-auto">
                <img src="/images/yearn.svg" alt="Yearn" width={22} height={27} />
                <div className="[&>button]:!bg-[#F6FC3B] [&>button]:!text-black [&>button]:!font-semibold [&>button]:!text-[11.25px] [&>button]:!py-2 [&>button]:!px-4 [&>button]:!rounded-3xl [&>button]:!h-auto [&>button]:hover:!bg-[#F6FC3B]/90 sm:hidden">
                  <ConnectButton chainStatus="icon" showBalance={false} />
                </div>
              </div>
              <nav className="flex items-center gap-5 ">
                <a
                  href="/"
                  className="text-white text-[13px] font-medium hover:text-[#F6FC3B] transition-colors border-r border-white/10 pr-5"
                >
                  yearn-oracle-watch
                </a>
                <a
                  href="https://yearn.fi/"
                  className="text-white/50 text-[13px] hover:text-white transition-colors"
                >
                  Yearn
                </a>
              </nav>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="[&>button]:!bg-[#F6FC3B] [&>button]:!text-black [&>button]:!font-semibold [&>button]:!text-[11.25px] [&>button]:!py-2 [&>button]:!px-4 [&>button]:!rounded-3xl [&>button]:!h-auto [&>button]:hover:!bg-[#F6FC3B]/90">
                <ConnectButton chainStatus="icon" showBalance={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
