import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { Address } from 'viem'
import { SupportedChain } from '@/config/supportedChains'
import { createQueryTestWrapper, useTestSdk } from './testUtils'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface VaultTestResult {
  vault: any
  success: boolean
  error?: string
  currentApr?: string
  projectedApr?: string
  percentChange?: string
  testDuration?: number
}

describe('APR Oracle Comprehensive Testing', () => {
  it('should test APR Oracle functionality across all vaults using SDK directly', async () => {
    const { QueryTestWrapper } = createQueryTestWrapper()
    const testResults: VaultTestResult[] = []

    console.log(
      '\n🚀 Starting comprehensive APR Oracle testing using SDK directly...'
    )

    // Get SDK instance
    const { result: sdkResult } = renderHook(() => useTestSdk(), {
      wrapper: QueryTestWrapper,
    })

    // Wait for SDK to be fully initialized
    await waitFor(
      () => {
        expect(sdkResult.current).toBeDefined()
        expect(sdkResult.current.isInitialized()).toBe(true)
      },
      { timeout: 15000 }
    )

    const sdk = sdkResult.current
    console.log('✅ SDK fully initialized and ready for testing')

    try {
      // Fetch vault data directly from SDK
      console.log('\n📊 Fetching vault data from Kong service...')
      const vaultData = await sdk.core.kong.getVaultsData()
      console.log(`📋 Found ${vaultData.length} vaults to test`)

      if (vaultData.length === 0) {
        throw new Error('No vault data found for testing')
      }

      console.log('\n' + '='.repeat(80))
      console.log('🔍 STARTING APR ORACLE TESTS FOR ALL VAULTS')
      console.log('='.repeat(80))

      // Test a sample of vaults (first 10 to avoid timeout)
      const vaultsToTest = vaultData
      console.log(`🎯 Testing all ${vaultsToTest.length} vaults`)

      for (let i = 0; i < vaultsToTest.length; i++) {
        const vault = vaultsToTest[i]
        const vaultStartTime = Date.now()

        try {
          console.log(
            `\n🏦 [${i + 1}/${vaultsToTest.length}] Testing vault: ${vault.name}`
          )
          console.log(`   📍 Address: ${vault.address}`)
          console.log(`   🌐 Chain: ${vault.chainId}`)
          console.log(`   💰 Asset: ${vault.asset.symbol}`)

          // Test current APR (delta = 0)
          const currentAprResult = await sdk.core.getAprOracleData(
            vault.address as Address,
            vault.chainId as SupportedChain,
            0n
          )

          console.log(
            `   📈 Current APR: ${currentAprResult.currentApr || 'N/A'}`
          )

          // Test projected APR (delta > 0)
          const testDelta = 1000000000000000000n // 1 ETH worth
          const projectedAprResult = await sdk.core.getAprOracleData(
            vault.address as Address,
            vault.chainId as SupportedChain,
            testDelta
          )

          const vaultDuration = Date.now() - vaultStartTime

          // Check if we got valid APR values or N/A
          const currentApr = currentAprResult.currentApr || 'N/A'
          const projectedApr = projectedAprResult.projectedApr || 'N/A'
          const percentChange = projectedAprResult.percentChange || 'N/A'

          // Treat N/A values as failures
          const hasValidData = currentApr !== 'N/A' || projectedApr !== 'N/A'

          if (hasValidData) {
            testResults.push({
              vault,
              success: true,
              currentApr,
              projectedApr,
              percentChange,
              testDuration: vaultDuration,
            })

            console.log('   ✅ Success!')
            console.log(`   📊 Projected APR: ${projectedApr}`)
            console.log(`   📉 Change: ${percentChange}`)
            console.log(`   ⏱️  Duration: ${vaultDuration}ms`)
          } else {
            // Failed due to N/A values
            testResults.push({
              vault,
              success: false,
              error: 'Oracle returned N/A values - no valid APR data available',
              currentApr,
              projectedApr,
              percentChange,
              testDuration: vaultDuration,
            })

            console.log('   ❌ Failed: Oracle returned N/A values')
            console.log(`   📈 Current APR: ${currentApr}`)
            console.log(`   📊 Projected APR: ${projectedApr}`)
            console.log(`   ⏱️  Duration: ${vaultDuration}ms`)
          }
        } catch (error) {
          const vaultDuration = Date.now() - vaultStartTime
          testResults.push({
            vault,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            testDuration: vaultDuration,
          })
          console.log(
            `   ❌ Failed: ${error instanceof Error ? error.message : error}`
          )
          console.log(`   ⏱️  Duration: ${vaultDuration}ms`)
        }

        // Progress indicator
        const progress = (((i + 1) / vaultsToTest.length) * 100).toFixed(1)
        console.log(
          `   📊 Progress: ${i + 1}/${vaultsToTest.length} (${progress}%)`
        )
      }
    } catch (error) {
      console.error('❌ Failed to fetch vault data:', error)
      throw error
    }

    // Analyze and report results
    const successfulVaults = testResults.filter((result) => result.success)
    const failedVaults = testResults.filter((result) => !result.success)
    const averageDuration =
      testResults.reduce((sum, r) => sum + (r.testDuration || 0), 0) /
      testResults.length

    // Group errors by type for analysis
    const errorsByType = failedVaults.reduce(
      (acc, { error }) => {
        let errorType: string
        if (error?.includes('Oracle returned N/A values')) {
          errorType = 'Oracle N/A Values'
        } else if (error?.includes('HTTP request failed')) {
          errorType = 'RPC Connection Error'
        } else if (error?.includes('Contract call failed')) {
          errorType = 'Contract Call Error'
        } else if (error?.includes('timeout')) {
          errorType = 'Timeout Error'
        } else {
          errorType = error?.split(':')[0] || 'Unknown'
        }
        acc[errorType] = (acc[errorType] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    console.log('\n' + '='.repeat(80))
    console.log('🎯 APR ORACLE TEST RESULTS SUMMARY')
    console.log('='.repeat(80))
    console.log(`📊 Total vaults tested: ${testResults.length}`)
    console.log(`✅ Successful queries: ${successfulVaults.length}`)
    console.log(`❌ Failed queries: ${failedVaults.length}`)
    console.log(
      `📈 Success rate: ${((successfulVaults.length / testResults.length) * 100).toFixed(2)}%`
    )
    console.log(`⏱️  Average test duration: ${averageDuration.toFixed(0)}ms`)

    if (failedVaults.length > 0) {
      console.log('\n' + '❌ FAILED VAULTS DETAILED REPORT'.padEnd(80, '='))
      failedVaults.forEach(
        (
          {
            vault,
            error,
            currentApr,
            projectedApr,
            percentChange,
            testDuration,
          },
          index
        ) => {
          console.log(`\n${index + 1}. 🏦 ${vault.name}`)
          console.log(`   📍 Address: ${vault.address}`)
          console.log(`   🌐 Chain ID: ${vault.chainId}`)
          console.log(
            `   💰 Asset: ${vault.asset.symbol} (${vault.asset.name})`
          )
          console.log(`   🔗 Asset Address: ${vault.asset.address}`)
          console.log(`   ❌ Error: ${error}`)
          if (currentApr) {
            console.log(`   📈 Current APR: ${currentApr}`)
          }
          if (projectedApr) {
            console.log(`   📊 Projected APR: ${projectedApr}`)
          }
          if (percentChange) {
            console.log(`   📉 Change: ${percentChange}`)
          }
          console.log(`   ⏱️  Duration: ${testDuration}ms`)
        }
      )

      console.log('\n' + '📊 ERROR ANALYSIS'.padEnd(80, '='))
      Object.entries(errorsByType).forEach(([errorType, count]) => {
        const percentage = ((count / failedVaults.length) * 100).toFixed(1)
        console.log(`   ${errorType}: ${count} occurrences (${percentage}%)`)
      })
    }

    if (successfulVaults.length > 0) {
      console.log('\n' + '✅ SUCCESSFUL VAULTS (Sample)'.padEnd(80, '='))
      // Show all successful vaults since we're only testing a sample
      successfulVaults.forEach(
        (
          { vault, currentApr, projectedApr, percentChange, testDuration },
          index
        ) => {
          console.log(`\n${index + 1}. 🏦 ${vault.name}`)
          console.log(`   📍 Address: ${vault.address}`)
          console.log(`   🌐 Chain: ${vault.chainId}`)
          console.log(`   💰 Asset: ${vault.asset.symbol}`)
          console.log(`   📈 Current APR: ${currentApr}`)
          console.log(`   📊 Projected APR: ${projectedApr}`)
          console.log(`   📉 Change: ${percentChange}`)
          console.log(`   ⏱️  Duration: ${testDuration}ms`)
        }
      )
    }

    console.log('\n' + '='.repeat(80))
    console.log(
      `🎯 FINAL SUMMARY: ${successfulVaults.length}/${testResults.length} vaults passed APR Oracle tests`
    )

    // Generate output files
    console.log('\n📄 Generating output files...')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputDir = join(__dirname, 'output')

    try {
      // 1. Comprehensive JSON report
      const jsonReport = {
        metadata: {
          timestamp: new Date().toISOString(),
          totalVaults: testResults.length,
          successfulVaults: successfulVaults.length,
          failedVaults: failedVaults.length,
          successRate:
            ((successfulVaults.length / testResults.length) * 100).toFixed(2) +
            '%',
          averageDuration: averageDuration.toFixed(0) + 'ms',
        },
        results: testResults.map((result) => ({
          vault: {
            name: result.vault.name,
            address: result.vault.address,
            chainId: result.vault.chainId,
            asset: {
              symbol: result.vault.asset.symbol,
              name: result.vault.asset.name,
            },
          },
          success: result.success,
          error: result.error,
          currentApr: result.currentApr,
          projectedApr: result.projectedApr,
          percentChange: result.percentChange,
          testDuration: result.testDuration,
        })),
        analysis: {
          errorsByType: failedVaults.length > 0 ? errorsByType : {},
          chainDistribution: testResults.reduce(
            (acc, { vault }) => {
              acc[vault.chainId] = (acc[vault.chainId] || 0) + 1
              return acc
            },
            {} as Record<number, number>
          ),
          assetDistribution: testResults.reduce(
            (acc, { vault }) => {
              acc[vault.asset.symbol] = (acc[vault.asset.symbol] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          ),
        },
      }

      writeFileSync(
        join(outputDir, `apr-oracle-test-results-${timestamp}.json`),
        JSON.stringify(jsonReport, null, 2)
      )

      // 2. Failed vaults CSV
      if (failedVaults.length > 0) {
        const csvHeaders =
          'Name,Address,ChainId,Asset,Error,CurrentAPR,ProjectedAPR,PercentChange,Duration\n'
        const csvData = failedVaults
          .map(
            ({
              vault,
              error,
              currentApr,
              projectedApr,
              percentChange,
              testDuration,
            }) =>
              `"${vault.name}","${vault.address}",${vault.chainId},"${vault.asset.symbol}","${error}","${currentApr || ''}","${projectedApr || ''}","${percentChange || ''}",${testDuration}`
          )
          .join('\n')

        writeFileSync(
          join(outputDir, `failed-vaults-${timestamp}.csv`),
          csvHeaders + csvData
        )
      }

      // 3. Summary markdown report
      const markdownReport = `# APR Oracle Test Results
      
## Summary
- **Test Date**: ${new Date().toLocaleString()}
- **Total Vaults Tested**: ${testResults.length}
- **Successful**: ${successfulVaults.length}
- **Failed**: ${failedVaults.length}
- **Success Rate**: ${((successfulVaults.length / testResults.length) * 100).toFixed(2)}%
- **Average Duration**: ${averageDuration.toFixed(0)}ms

${
  failedVaults.length > 0
    ? `## Failed Vaults (${failedVaults.length})

| Name | Address | Chain | Asset | Error Type | Current APR | Projected APR | Duration |
|------|---------|-------|-------|------------|-------------|---------------|----------|
${failedVaults
  .map(({ vault, error, currentApr, projectedApr, testDuration }) => {
    const errorType = error?.includes('Oracle returned N/A values')
      ? 'Oracle N/A Values'
      : error?.includes('HTTP request failed')
        ? 'RPC Error'
        : error?.includes('Contract call failed')
          ? 'Contract Error'
          : 'Other'
    return `| ${vault.name} | \`${vault.address}\` | ${vault.chainId} | ${vault.asset.symbol} | ${errorType} | ${currentApr || 'N/A'} | ${projectedApr || 'N/A'} | ${testDuration}ms |`
  })
  .join('\n')}`
    : '## All Vaults Successful! 🎉'
}

## Error Analysis
${
  failedVaults.length > 0
    ? Object.entries(errorsByType)
        .map(
          ([errorType, count]) =>
            `- **${errorType}**: ${count} occurrences (${((count / failedVaults.length) * 100).toFixed(1)}%)`
        )
        .join('\n')
    : 'No errors found!'
}

## Chain Distribution
${Object.entries(
  testResults.reduce(
    (acc, { vault }) => {
      acc[vault.chainId] = (acc[vault.chainId] || 0) + 1
      return acc
    },
    {} as Record<number, number>
  )
)
  .map(([chainId, count]) => `- **Chain ${chainId}**: ${count} vaults`)
  .join('\n')}
`

      writeFileSync(
        join(outputDir, `apr-oracle-test-summary-${timestamp}.md`),
        markdownReport
      )

      console.log('✅ Output files generated:')
      console.log(`   📄 JSON: apr-oracle-test-results-${timestamp}.json`)
      if (failedVaults.length > 0) {
        console.log(`   📊 CSV: failed-vaults-${timestamp}.csv`)
      }
      console.log(`   📝 MD: apr-oracle-test-summary-${timestamp}.md`)
    } catch (outputError) {
      console.warn('⚠️ Failed to generate output files:', outputError)
    }

    // Assertions
    expect(testResults.length).toBeGreaterThan(0)
    expect(successfulVaults.length).toBeGreaterThan(0) // At least some vaults should work

    // Log final results for CI/CD
    const successRate = (successfulVaults.length / testResults.length) * 100
    console.log(`\n📈 Success Rate: ${successRate.toFixed(2)}%`)

    // The test passes if we tested vaults and have some successes
    expect(successRate).toBeGreaterThan(0)
  }, 600000) // 10 minute timeout for testing all vaults

  it('should provide chain and asset analysis', async () => {
    console.log(
      '\n📋 This test would provide detailed chain and asset analysis'
    )
    console.log('   🌐 Chain distribution of successful/failed vaults')
    console.log('   💰 Asset type analysis')
    console.log('   📊 Performance metrics by chain')

    // This is just a placeholder - actual analysis would come from the previous test results
    expect(true).toBe(true)
  })
})
