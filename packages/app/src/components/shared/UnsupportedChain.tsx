import { supportedChains } from '@/config/supportedChains'
import { FC } from 'react'
import { useChainId } from 'wagmi'

export const UnsupportedChain: FC = () => {
  const chainId = useChainId()
  const supportedChainIds = supportedChains.map((chain) => chain.id)

  return (
    <div className="flex justify-center p-8 pt-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chain Not Yet Supported</h1>
          <p className="text-gray-600 mb-6">
            {`Chain ${chainId}`} is not yet supported
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Currently supported chains:</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {supportedChains
                .filter((chain) => supportedChainIds.includes(chain.id))
                .map((chain) => (
                  <span
                    key={chain.id}
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700"
                  >
                    {chain.name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
