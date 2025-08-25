# Paste-Address Vault Discovery – Implementation Plan

Goal: Enable users to paste a vault contract address into the vault select modal’s search bar. If the pasted address is not found in the fetched vault list, probe supported chains using our v3Vault ABI to discover vault metadata directly from the contract and present the chain-specific matches as selectable results. Once selected, proceed to query AprOracle as normal.

## Requirements coverage

- Paste an address in the vault select modal search bar. ✅ Handled via search input; detect if value is a valid EVM address.
- If the vault isn’t in the fetched list, attempt contract parsing using v3Vault ABI. ✅ SDK method to read contract: name(), symbol(), asset(), decimals() from the pasted address across chains.
- Show options for each chain where that contract exists. ✅ Aggregate successful reads per chainId and surface as vault candidates.
- Selecting the discovered vault should query AprOracle normally. ✅ Selected item conforms to `VaultData` shape; APR path remains unchanged.

## Quick architecture review

- App modal and search lives in `packages/app/src/components/pages/home/VaultQueryCard.tsx` and list item component in `components/shared/VaultListItem.tsx`.
- Vault list data comes from SDK via `useGetVaults()` (Kong source) and is shown in a VirtualScrollList.
- APR is queried via `useAprOracle` which calls `sdk.core.getAprOracleData(...)` using `aprOracleAbi` and `aprOracleAddress` from `@yearn-oracle-watch/contracts`.
- Contracts package now includes `v3Vault.json` and `v3VaultAbi` exported in `packages/contracts/src/wagmi.ts`. `erc20Abi` is also exported for base token metadata.

## Data contract we need to output

The modal expects `VaultData`:

- address: Address (the vault address pasted by the user)
- symbol: string (the vault’s share token symbol)
- name: string (the vault’s name)
- chainId: number (the chain where the contract was found)
- asset: { address: Address, name: string, symbol: string, decimals: number }

v3Vault will give us:

- name() → vault name
- symbol() → vault symbol (useful; not explicitly required but needed by UI)
- asset() → underlying token address
- decimals() → vault share decimals (used for formatting but not used in APR delta math)

The UI uses `selectedVault.asset.decimals` for delta math and renders asset logos by `asset.address`. Therefore, we must also call ERC20 on `asset()` to get token decimals and metadata:

- erc20.decimals(), erc20.symbol(), erc20.name()

## SDK changes

Add a discovery method to `CoreDataSource` that probes chains for a valid v3 vault contract at a pasted address.

Proposed method signature:

- `discoverVaultsFromContract(address: Address, chainIds?: number[]): Promise<VaultData[]>`
  - Inputs: a vault address, optional list of chainIds to probe
  - Output: Array of `VaultData` entries, one per chain where the v3 interface responds successfully

Behavior:

1. Determine chain set to probe:
   - Default: the same chain IDs supported by the app (mainnet, optimism, gnosis, polygon, sonic, base, arbitrum). The hook (see below) can pass this list from app-level `supportedChains` to avoid SDK–app coupling.
2. For each chainId, attempt reads from the pasted address using `v3VaultAbi`:
   - name(), symbol(), asset(), decimals()
   - If any of these fail with an interface error or revert, skip this chain.
3. Once `asset` is read, call ERC20 on that asset address:
   - erc20.decimals(), erc20.symbol(), erc20.name()
   - If token calls fail, still include the candidate with at least asset address and fallback decimals (try 18) — but prefer to include only successful reads for correctness.
4. Return a `VaultData` per successful chain with fields filled as above.

Implementation notes:

- Use `readContracts` with `wagmiConfig` and include `chainId` per call entry to batch per chain where sensible.
- Normalize addresses using `viem` `getAddress` when constructing results.
- Apply minimal caching at the call site via react-query (in app hook). Keep SDK method pure.

Error handling:

- Silent per-chain failure; only return successes.
- If no chains succeed, return `[]`.

## App changes

1) New hook: `useDiscoverVaultByAddress(address?: string)`

- Validates `address` with `isAddress` (from `viem`).
- Determines `chainIds` from `supportedChains` in `packages/app/src/config/supportedChains.ts`.
- Uses `useSdk()` and `useQuery` with key `['discover-vault', checksumAddress, chainIds]`.
- Calls `sdk.core.discoverVaultsFromContract(checksumAddress, chainIds)`.
- Returns `{ data, isLoading, error }`.

2) Wire into `VaultQueryCard` search pipeline

- Current debounced search filters the fetched list by term. Extend it:
  - If `searchTerm` is a valid address AND filtered results are empty (or do not include that exact address on any chain), run the discovery hook.
  - Merge `discoveredVaults` into the list for display. Ensure de-duplication if some chains already have the vault in the fetched list.
- UI states for discovery:
  - While discovery `isLoading`: optionally show a “probing chains…” row above the list or rely on default loading states.
  - If discovery returns candidates, show them as ordinary rows; selection updates URL and triggers APR exactly like normal.
  - If discovery returns nothing, keep the “No vaults found” message.

3) Selection and APR (no changes)

- On select, existing code sets `selectedVault`, sets `deltaValue=0n`, updates URL, and closes modal.
- `useAprOracle` will run as-is using `selectedVault.address` and `selectedVault.chainId`.

## Pseudocode outline

SDK (`CoreDataSource`):

- `discoverVaultsFromContract(address, chainIds)`
  - for each chainId in chainIds:
    - try call: vault.name, vault.symbol, vault.asset, vault.decimals
    - then call erc20 on `asset`: decimals, symbol, name
    - build `VaultData` and push to results
  - return results

App hook:

- `useDiscoverVaultByAddress(addr)`
  - if not `isAddress(addr)`: disabled
  - queryFn → `sdk.core.discoverVaultsFromContract(addr, supportedChainIds)`

VaultQueryCard:

- On `searchTerm` change:
  - run existing filter
  - if `isAddress(searchTerm)` and not found in `filtered` (or `filtered` is empty): use discovery hook → merge discovered into `filteredVaults`

## Edge cases & UX

- Invalid address: do nothing special; filtered list logic remains; discovery is disabled.
- Contract present but not v3-compliant (missing functions): skip that chain silently.
- Asset ERC20 calls fail: optionally show with minimal info; recommended to require successful ERC20 `decimals` to support delta math. If decimals missing, hide candidate.
- Rate limiting: chain count is small; use single in-flight query per address via react-query to avoid hammering RPCs while typing.
- Logos: `VaultListItem` already derives logos using `asset.address` + chain, so discovered entries will display as usual.

## Types and data shape

- Use existing `VaultData` from `useGetVaults.ts` to ensure compatibility.
- Ensure vault `symbol` is the vault’s share token symbol from v3 (not asset symbol) — consistent with existing data.

## Testing and verification

- Unit-ish: Add a temporary console log in `CoreDataSource.discoverVaultsFromContract` for chain successes during local runs.
- Manual:
  1. Start app, open vault modal.
  2. Paste a known v3 vault address not in the fetched list; see discovery results for each supported chain with a valid deployment.
  3. Select one; verify APR values populate via AprOracle and deltas work.
  4. Verify logos render and address copying still works.

## Performance & caching

- Discovery queries are short-lived and behind a strict `isAddress` check.
- React-query caching: low `staleTime` (e.g., 30–60s) is enough; key on address+chainIds to reuse between keystrokes.

## Implementation steps checklist

1) SDK

- [ ] Add `discoverVaultsFromContract` to `CoreDataSource`.
- [ ] Export types if needed (reuse existing `VaultData` shape in app or create an SDK equivalent).

2) App

- [ ] Create `useDiscoverVaultByAddress` hook.
- [ ] Update `VaultQueryCard` search flow to merge discovery results when appropriate.
- [ ] Keep button and modal composition patterns intact.

3) Docs/Dev workflow

- [ ] After SDK changes: run `cd packages/sdk && bun run codegen && bun run build`.
- [ ] Restart app dev server to pick up SDK updates.

## Minimal code paths to touch

- SDK: `packages/sdk/src/datasources/CoreDataSource.ts` (new method only)
- App: `packages/app/src/hooks/useDiscoverVaultByAddress.ts` (new), `packages/app/src/components/pages/home/VaultQueryCard.tsx` (search integration)

## Open questions / assumptions

- Assumption: Using app’s `supportedChains` IDs for probe order. If a different set is desired for SDK, we can add a config field in `SdkConfig`.
- Assumption: We’ll require ERC20 `decimals` success for asset to ensure correct delta math; otherwise, we’ll omit that chain’s candidate.
- Optional: We can surface a small “From contract” subheader above discovered rows for clarity; otherwise, simply merging is fine to keep the UI simple.

## Rollout

- Implement SDK method and app hook, wire up, verify locally.
- No breaking changes to existing flows or APIs.

## Completed work summary (commit 87d21b12)

Scope: Implement paste-address discovery across SDK, contracts, and app UI; integrate on-chain results into the modal with clear UX cues; keep APR flow unchanged.

- Contracts
  - Added `v3Vault.json` ABI and wired it into contracts exports (via wagmi manifest).

- SDK
  - Implemented `discoverVaultsFromContract` in `packages/sdk/src/datasources/CoreDataSource.ts` to probe supported chains using `v3VaultAbi` and `erc20Abi` to return `VaultData`-compatible entries.
  - Updated Kong GraphQL artifacts (`schema.graphql`, `generated.ts`) via codegen.

- App
  - Added `useDiscoverVaultByAddress.ts` hook to call the new SDK method with app `supportedChains`.
  - Updated `VaultQueryCard.tsx`:
    - Debounced search continues to filter indexer results; when a valid address is entered, runs background on-chain discovery and merges results with de-duplication by `chainId-address`.
    - Shows an inline loader and message in the empty-state when probing on-chain (address search with no indexer matches).
    - Maintains URL updates on selection and triggers APR as before.
  - Improved `YearnLoader.tsx`:
    - New props: `fixed` (overlay vs flow; default true) and `color` ('white' | 'blue'; default 'white').
    - Modal uses `fixed={false} color="blue"`; main page fallback uses `fixed={true}` default color.
  - Enhanced `VaultListItem.tsx`:
    - Accepts `discovered` flag. Displays a right-aligned warning icon (⚠️) with tooltip: "This vault was not found in the indexer and may not be endorsed by Yearn." for on-chain discovered entries.

- Docs
  - This plan document updated to reflect implementation details and status.

Verification

- Build and codegen completed successfully for SDK and app. App renders indexer results immediately; on-chain discoveries merge in with a clear loading state and indicator. APR querying path unchanged and functional when selecting either indexer or discovered vaults.

Requirements coverage status

- Address paste + v3 contract probing across chains: Done.
- Present per-chain options; merge and de-duplicate with indexer results: Done.
- APR Oracle querying on selection: Done (unchanged API).
- UX polish: inline loader in modal empty-state; indicator for on-chain discovered items: Done.
