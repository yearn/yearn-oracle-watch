import { FC } from 'react'
import { useTokenPrices, findTokenPrice } from '../../../hooks/useTokenPrices'
import { useSdk } from '../../../context/Sdk'

export const TokenPricesTest: FC = () => {
  const sdk = useSdk()
  const { data: prices, isLoading, error } = useTokenPrices()

  // Debug the SDK structure
  console.log('SDK:', sdk)
  console.log('SDK core:', sdk?.core)
  console.log('SDK yDaemon:', sdk?.core?.yDaemon)
  console.log('getPrices method:', sdk?.core?.yDaemon?.getPrices)

  if (isLoading) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 m-4 bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">Token Prices Test</h3>
        <p>Loading prices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 m-4 bg-red-50">
        <h3 className="text-lg font-semibold mb-2">Token Prices Test</h3>
        <p className="text-red-600">Error: {error.message}</p>
        <div className="mt-2 text-xs">
          <p>SDK available: {!!sdk ? 'Yes' : 'No'}</p>
          <p>Core available: {!!sdk?.core ? 'Yes' : 'No'}</p>
          <p>YDaemon available: {!!sdk?.core?.yDaemon ? 'Yes' : 'No'}</p>
          <p>
            getPrices available:{' '}
            {typeof sdk?.core?.yDaemon?.getPrices === 'function' ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    )
  }

  if (!prices) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 m-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Token Prices Test</h3>
        <p>No price data available</p>
      </div>
    )
  }

  // Test some common token addresses (all addresses lowercased)
  const testTokens = [
    {
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      chainId: 1,
    },
    {
      symbol: 'USDC',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chainId: 1,
    }, // Common USDC address
    {
      symbol: 'WETH',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chainId: 1,
    }, // WETH address
    {
      symbol: 'DAI',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      chainId: 1,
    }, // DAI address
  ]

  const chainsWithData = Object.keys(prices)
  const totalTokens = Object.values(prices).reduce(
    (sum, chainPrices) => sum + Object.keys(chainPrices).length,
    0
  )

  return (
    <div className="border border-green-300 rounded-lg p-4 m-4 bg-green-50">
      <h3 className="text-lg font-semibold mb-2">
        ✅ Token Prices Test - SUCCESS
      </h3>

      <div className="mb-4">
        <p>
          <strong>Total Chains:</strong> {chainsWithData.length}
        </p>
        <p>
          <strong>Total Tokens:</strong> {totalTokens}
        </p>
        <p>
          <strong>Chains:</strong> {chainsWithData.join(', ')}
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Sample Prices:</h4>
        {testTokens.map((token) => {
          const price = findTokenPrice(prices, token.address, token.chainId)

          // Debug: Check if address exists in different formats
          const chainPrices = prices[token.chainId.toString()]
          const lowerExists = chainPrices?.[token.address.toLowerCase()]
          const upperExists = chainPrices?.[token.address.toUpperCase()]
          const originalExists = chainPrices?.[token.address]

          return (
            <div key={`${token.chainId}-${token.address}`} className="mb-1">
              <span className="font-mono text-sm">
                {token.symbol}: {price ? `$${price.toFixed(2)}` : 'Not found'}
              </span>
              {!price && (
                <div className="text-xs text-gray-600 ml-4">
                  Lower: {lowerExists ? '✓' : '✗'} | Upper:{' '}
                  {upperExists ? '✓' : '✗'} | Original:{' '}
                  {originalExists ? '✓' : '✗'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Chain 1 Sample (first 5 tokens):</h4>
        <div className="text-xs font-mono bg-gray-100 p-2 rounded">
          {prices['1']
            ? Object.entries(prices['1'])
                .slice(0, 5)
                .map(([address, price]) => (
                  <div key={address} className="mb-1">
                    {address}: {price} ($
                    {(parseFloat(price) / 1_000_000).toFixed(2)})
                  </div>
                ))
            : 'No data for chain 1'}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Address Format Check:</h4>
        <div className="text-xs font-mono bg-gray-100 p-2 rounded">
          {prices['1'] ? (
            <div>
              <p>Sample addresses from API (first 10):</p>
              {Object.keys(prices['1'])
                .slice(0, 10)
                .map((addr) => (
                  <div key={addr} className="ml-2">
                    • {addr} (length: {addr.length})
                  </div>
                ))}
              <p className="mt-2">Our test addresses:</p>
              {testTokens.map((token) => (
                <div key={token.symbol} className="ml-2">
                  • {token.symbol}: {token.address} (exists:{' '}
                  {prices['1'][token.address]
                    ? '✓'
                    : prices['1'][token.address.toLowerCase()]
                      ? '✓ (lowercase)'
                      : '✗'}
                  )
                </div>
              ))}
            </div>
          ) : (
            'No data for chain 1'
          )}
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer font-semibold">
          View Raw Data (first 100 chars)
        </summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(prices, null, 2).substring(0, 500)}...
        </pre>
      </details>
    </div>
  )
}
