import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: string; output: string; }
};

export type kong_AccountRole = {
  account: Scalars['String']['output'];
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  roleMask: Scalars['BigInt']['output'];
};

export type kong_Accountant = {
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  feeManager: Scalars['String']['output'];
  feeRecipient: Scalars['String']['output'];
  futureFeeManager?: Maybe<Scalars['String']['output']>;
  managementFeeThreshold?: Maybe<Scalars['BigInt']['output']>;
  maxLoss?: Maybe<Scalars['BigInt']['output']>;
  performanceFeeThreshold?: Maybe<Scalars['BigInt']['output']>;
  vaultManager?: Maybe<Scalars['String']['output']>;
  vaults?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type kong_Allocator = {
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  vault: Scalars['String']['output'];
};

export type kong_ApetaxStat = {
  active: Scalars['Int']['output'];
  new: Scalars['Int']['output'];
  stealth: Scalars['Int']['output'];
  withdraw: Scalars['Int']['output'];
};

export type kong_Apr = {
  gross?: Maybe<Scalars['Float']['output']>;
  net?: Maybe<Scalars['Float']['output']>;
};

export type kong_Apy = {
  blockNumber: Scalars['String']['output'];
  blockTime: Scalars['String']['output'];
  grossApr?: Maybe<Scalars['Float']['output']>;
  inceptionNet?: Maybe<Scalars['Float']['output']>;
  monthlyNet?: Maybe<Scalars['Float']['output']>;
  net?: Maybe<Scalars['Float']['output']>;
  weeklyNet?: Maybe<Scalars['Float']['output']>;
};

export enum kong_CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type kong_DbInfo = {
  cacheHitRate: Scalars['Float']['output'];
  clients: Scalars['Int']['output'];
  databaseSize: Scalars['BigInt']['output'];
  indexHitRate: Scalars['Float']['output'];
};

export type kong_Debt = {
  activation?: Maybe<Scalars['BigInt']['output']>;
  currentDebt?: Maybe<Scalars['BigInt']['output']>;
  currentDebtUsd?: Maybe<Scalars['Float']['output']>;
  debtRatio?: Maybe<Scalars['BigInt']['output']>;
  lastReport?: Maybe<Scalars['BigInt']['output']>;
  maxDebt?: Maybe<Scalars['BigInt']['output']>;
  maxDebtPerHarvest?: Maybe<Scalars['BigInt']['output']>;
  maxDebtRatio?: Maybe<Scalars['Float']['output']>;
  maxDebtUsd?: Maybe<Scalars['Float']['output']>;
  minDebtPerHarvest?: Maybe<Scalars['BigInt']['output']>;
  performanceFee?: Maybe<Scalars['BigInt']['output']>;
  strategy?: Maybe<Scalars['String']['output']>;
  targetDebtRatio?: Maybe<Scalars['Float']['output']>;
  totalDebt?: Maybe<Scalars['BigInt']['output']>;
  totalDebtUsd?: Maybe<Scalars['Float']['output']>;
  totalGain?: Maybe<Scalars['BigInt']['output']>;
  totalGainUsd?: Maybe<Scalars['Float']['output']>;
  totalLoss?: Maybe<Scalars['BigInt']['output']>;
  totalLossUsd?: Maybe<Scalars['Float']['output']>;
};

export type kong_Deposit = {
  amount: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  recipient: Scalars['String']['output'];
  shares: Scalars['String']['output'];
  vaultAddress: Scalars['String']['output'];
};

export type kong_Erc20 = {
  address?: Maybe<Scalars['String']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
};

export type kong_Fees = {
  managementFee?: Maybe<Scalars['Float']['output']>;
  performanceFee?: Maybe<Scalars['Float']['output']>;
};

export type kong_IngestCpu = {
  usage: Scalars['Float']['output'];
};

export type kong_IngestInfo = {
  cpu: kong_IngestCpu;
  memory: kong_IngestMemory;
};

export type kong_IngestMemory = {
  total: Scalars['BigInt']['output'];
  used: Scalars['BigInt']['output'];
};

export type kong_LatestBlock = {
  blockNumber: Scalars['BigInt']['output'];
  blockTime: Scalars['BigInt']['output'];
  chainId: Scalars['Int']['output'];
};

export type kong_LenderStatus = {
  address?: Maybe<Scalars['String']['output']>;
  assets?: Maybe<Scalars['BigInt']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rate?: Maybe<Scalars['BigInt']['output']>;
};

export type kong_Monitor = {
  db: kong_DbInfo;
  indexStatsJson: Scalars['String']['output'];
  ingest: kong_IngestInfo;
  queues?: Maybe<Array<Maybe<kong_QueueStatus>>>;
  redis: kong_RedisInfo;
};

export type kong_NetworkStat = {
  chainId: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
};

export type kong_NewSplitterLog = {
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  manager: Scalars['String']['output'];
  managerRecipient: Scalars['String']['output'];
  splitee: Scalars['String']['output'];
  splitter: Scalars['String']['output'];
};

export type kong_NewYieldSplitterLog = {
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  splitter: Scalars['String']['output'];
  vault: Scalars['String']['output'];
  want: Scalars['String']['output'];
};

export type kong_Output = {
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  component?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  period: Scalars['String']['output'];
  time?: Maybe<Scalars['BigInt']['output']>;
  value: Scalars['Float']['output'];
};

export type kong_Price = {
  address: Scalars['String']['output'];
  blockNumber: Scalars['BigInt']['output'];
  chainId: Scalars['Int']['output'];
  priceSource: Scalars['String']['output'];
  priceUsd: Scalars['Float']['output'];
  timestamp: Scalars['BigInt']['output'];
};

export type kong_Project = {
  accountant: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  debtAllocator: Scalars['String']['output'];
  governance: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  registry: Scalars['String']['output'];
  roleManager: Scalars['String']['output'];
  roleManagerFactory: Scalars['String']['output'];
};

export type kong_Query = {
  accountRoles?: Maybe<Array<Maybe<kong_AccountRole>>>;
  accountStrategies?: Maybe<Array<Maybe<kong_Strategy>>>;
  accountVaults?: Maybe<Array<Maybe<kong_Vault>>>;
  accountant?: Maybe<kong_Accountant>;
  accountants?: Maybe<Array<Maybe<kong_Accountant>>>;
  allocator?: Maybe<kong_Allocator>;
  bananas?: Maybe<Scalars['String']['output']>;
  deposits?: Maybe<Array<Maybe<kong_Deposit>>>;
  latestBlocks?: Maybe<Array<Maybe<kong_LatestBlock>>>;
  monitor?: Maybe<kong_Monitor>;
  newSplitterLogs?: Maybe<Array<Maybe<kong_NewSplitterLog>>>;
  newYieldSplitterLogs?: Maybe<Array<Maybe<kong_NewYieldSplitterLog>>>;
  prices?: Maybe<Array<Maybe<kong_Price>>>;
  projects?: Maybe<Array<Maybe<kong_Project>>>;
  riskScores?: Maybe<Array<Maybe<kong_RiskScore>>>;
  strategies?: Maybe<Array<Maybe<kong_Strategy>>>;
  strategy?: Maybe<kong_Strategy>;
  strategyReports?: Maybe<Array<Maybe<kong_StrategyReport>>>;
  things?: Maybe<Array<Maybe<kong_Thing>>>;
  timeseries?: Maybe<Array<Maybe<kong_Output>>>;
  tokens?: Maybe<Array<Maybe<kong_Erc20>>>;
  transfers?: Maybe<Array<Maybe<kong_Transfer>>>;
  tvls?: Maybe<Array<Maybe<kong_Tvl>>>;
  vault?: Maybe<kong_Vault>;
  vaultAccounts?: Maybe<Array<Maybe<kong_AccountRole>>>;
  vaultReports?: Maybe<Array<Maybe<kong_VaultReport>>>;
  vaultStrategies?: Maybe<Array<Maybe<kong_Strategy>>>;
  vaults?: Maybe<Array<Maybe<kong_Vault>>>;
  vestingEscrowCreatedLogs?: Maybe<Array<Maybe<kong_VestingEscrowCreatedLog>>>;
};


export type kong_QueryAccountRolesArgs = {
  account: Scalars['String']['input'];
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryAccountStrategiesArgs = {
  account: Scalars['String']['input'];
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryAccountVaultsArgs = {
  account: Scalars['String']['input'];
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryAccountantArgs = {
  address: Scalars['String']['input'];
  chainId: Scalars['Int']['input'];
};


export type kong_QueryAccountantsArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryAllocatorArgs = {
  chainId: Scalars['Int']['input'];
  vault: Scalars['String']['input'];
};


export type kong_QueryDepositsArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryLatestBlocksArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryNewSplitterLogsArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  manager?: InputMaybe<Scalars['String']['input']>;
  managerRecipient?: InputMaybe<Scalars['String']['input']>;
  splitter?: InputMaybe<Scalars['String']['input']>;
};


export type kong_QueryNewYieldSplitterLogsArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  splitter?: InputMaybe<Scalars['String']['input']>;
  vault?: InputMaybe<Scalars['String']['input']>;
  want?: InputMaybe<Scalars['String']['input']>;
};


export type kong_QueryPricesArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
};


export type kong_QueryProjectsArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryStrategiesArgs = {
  apiVersion?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  erc4626?: InputMaybe<Scalars['Boolean']['input']>;
};


export type kong_QueryStrategyArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryStrategyReportsArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryThingsArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  labels: Array<InputMaybe<Scalars['String']['input']>>;
};


export type kong_QueryTimeseriesArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  component?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  yearn?: InputMaybe<Scalars['Boolean']['input']>;
};


export type kong_QueryTokensArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryTransfersArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryTvlsArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
};


export type kong_QueryVaultArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryVaultAccountsArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  vault?: InputMaybe<Scalars['String']['input']>;
};


export type kong_QueryVaultReportsArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
};


export type kong_QueryVaultStrategiesArgs = {
  chainId?: InputMaybe<Scalars['Int']['input']>;
  vault?: InputMaybe<Scalars['String']['input']>;
};


export type kong_QueryVaultsArgs = {
  addresses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  apiVersion?: InputMaybe<Scalars['String']['input']>;
  chainId?: InputMaybe<Scalars['Int']['input']>;
  erc4626?: InputMaybe<Scalars['Boolean']['input']>;
  v3?: InputMaybe<Scalars['Boolean']['input']>;
  vaultType?: InputMaybe<Scalars['Int']['input']>;
  yearn?: InputMaybe<Scalars['Boolean']['input']>;
};


export type kong_QueryVestingEscrowCreatedLogsArgs = {
  recipient?: InputMaybe<Scalars['String']['input']>;
};

export type kong_QueueStatus = {
  active: Scalars['Int']['output'];
  failed: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  waiting: Scalars['Int']['output'];
};

export type kong_RedisInfo = {
  clients: Scalars['Int']['output'];
  memory: kong_RedisMemory;
  mode: Scalars['String']['output'];
  os: Scalars['String']['output'];
  uptime: Scalars['Int']['output'];
  version: Scalars['String']['output'];
};

export type kong_RedisMemory = {
  fragmentation: Scalars['Float']['output'];
  peak: Scalars['BigInt']['output'];
  total: Scalars['BigInt']['output'];
  used: Scalars['BigInt']['output'];
};

export type kong_ReportApr = {
  gross?: Maybe<Scalars['Float']['output']>;
  net?: Maybe<Scalars['Float']['output']>;
};

export type kong_ReportDetail = {
  address?: Maybe<Scalars['String']['output']>;
  apr?: Maybe<kong_Apr>;
  blockNumber?: Maybe<Scalars['BigInt']['output']>;
  blockTime?: Maybe<Scalars['BigInt']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  loss?: Maybe<Scalars['BigInt']['output']>;
  lossUsd?: Maybe<Scalars['Float']['output']>;
  profit?: Maybe<Scalars['BigInt']['output']>;
  profitUsd?: Maybe<Scalars['Float']['output']>;
  transactionHash?: Maybe<Scalars['String']['output']>;
};

export type kong_Reward = {
  address?: Maybe<Scalars['String']['output']>;
  balance?: Maybe<Scalars['BigInt']['output']>;
  balanceUsd?: Maybe<Scalars['Float']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
};

export type kong_RiskScore = {
  auditScore?: Maybe<Scalars['Float']['output']>;
  codeReviewScore?: Maybe<Scalars['Float']['output']>;
  complexityScore?: Maybe<Scalars['Float']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  protocolSafetyScore?: Maybe<Scalars['Float']['output']>;
  teamKnowledgeScore?: Maybe<Scalars['Float']['output']>;
  testingScore?: Maybe<Scalars['Float']['output']>;
};

export type kong_Role = {
  account: Scalars['String']['output'];
  roleMask: Scalars['BigInt']['output'];
};

export type kong_RoleManager = {
  accountant: Scalars['String']['output'];
  address: Scalars['String']['output'];
  allocatorFactory: Scalars['String']['output'];
  brain: Scalars['String']['output'];
  brainRoles: Scalars['BigInt']['output'];
  chad: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  daddy: Scalars['String']['output'];
  daddyRoles: Scalars['BigInt']['output'];
  debtAllocator: Scalars['String']['output'];
  debtAllocatorRoles: Scalars['BigInt']['output'];
  defaultProfitMaxUnlock: Scalars['BigInt']['output'];
  governance: Scalars['String']['output'];
  keeper: Scalars['String']['output'];
  keeperRoles: Scalars['BigInt']['output'];
  pendingGovernance: Scalars['String']['output'];
  project: kong_Project;
  registry: Scalars['String']['output'];
  roleManagerFactory: Scalars['String']['output'];
  security: Scalars['String']['output'];
  securityRoles: Scalars['BigInt']['output'];
  strategyManager: Scalars['String']['output'];
  strategyManagerRoles: Scalars['BigInt']['output'];
};

export type kong_SparklinePoint = {
  address: Scalars['String']['output'];
  blockTime: Scalars['BigInt']['output'];
  chainId: Scalars['Int']['output'];
  close: Scalars['Float']['output'];
  component?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
};

export type kong_Sparklines = {
  apy?: Maybe<Array<Maybe<kong_SparklinePoint>>>;
  tvl?: Maybe<Array<Maybe<kong_SparklinePoint>>>;
};

export type kong_Strategy = {
  DOMAIN_SEPARATOR?: Maybe<Scalars['String']['output']>;
  FACTORY?: Maybe<Scalars['String']['output']>;
  MAX_FEE?: Maybe<Scalars['Int']['output']>;
  MIN_FEE?: Maybe<Scalars['Int']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  apiVersion?: Maybe<Scalars['String']['output']>;
  balanceOfWant?: Maybe<Scalars['BigInt']['output']>;
  baseFeeOracle?: Maybe<Scalars['String']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  claims?: Maybe<Array<Maybe<kong_Reward>>>;
  creditThreshold?: Maybe<Scalars['BigInt']['output']>;
  crv?: Maybe<Scalars['String']['output']>;
  curveVoter?: Maybe<Scalars['String']['output']>;
  decimals?: Maybe<Scalars['Int']['output']>;
  delegatedAssets?: Maybe<Scalars['BigInt']['output']>;
  doHealthCheck?: Maybe<Scalars['Boolean']['output']>;
  emergencyExit?: Maybe<Scalars['Boolean']['output']>;
  erc4626?: Maybe<Scalars['Boolean']['output']>;
  estimatedTotalAssets?: Maybe<Scalars['BigInt']['output']>;
  forceHarvestTriggerOnce?: Maybe<Scalars['Boolean']['output']>;
  fullProfitUnlockDate?: Maybe<Scalars['BigInt']['output']>;
  gauge?: Maybe<Scalars['String']['output']>;
  healthCheck?: Maybe<Scalars['String']['output']>;
  inceptBlock?: Maybe<Scalars['BigInt']['output']>;
  inceptTime?: Maybe<Scalars['BigInt']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isBaseFeeAcceptable?: Maybe<Scalars['Boolean']['output']>;
  isOriginal?: Maybe<Scalars['Boolean']['output']>;
  isShutdown?: Maybe<Scalars['Boolean']['output']>;
  keeper?: Maybe<Scalars['String']['output']>;
  lastReport?: Maybe<Scalars['BigInt']['output']>;
  lastReportDetail?: Maybe<kong_ReportDetail>;
  lenderStatuses?: Maybe<Array<Maybe<kong_LenderStatus>>>;
  localKeepCRV?: Maybe<Scalars['BigInt']['output']>;
  management?: Maybe<Scalars['String']['output']>;
  maxReportDelay?: Maybe<Scalars['BigInt']['output']>;
  meta?: Maybe<kong_StrategyMeta>;
  metadataURI?: Maybe<Scalars['String']['output']>;
  minReportDelay?: Maybe<Scalars['BigInt']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pendingManagement?: Maybe<Scalars['String']['output']>;
  performanceFee?: Maybe<Scalars['Int']['output']>;
  performanceFeeRecipient?: Maybe<Scalars['String']['output']>;
  pricePerShare?: Maybe<Scalars['BigInt']['output']>;
  profitMaxUnlockTime?: Maybe<Scalars['BigInt']['output']>;
  profitUnlockingRate?: Maybe<Scalars['BigInt']['output']>;
  proxy?: Maybe<Scalars['String']['output']>;
  rewards?: Maybe<Scalars['String']['output']>;
  risk?: Maybe<kong_RiskScore>;
  stakedBalance?: Maybe<Scalars['BigInt']['output']>;
  strategist?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  totalAssets?: Maybe<Scalars['BigInt']['output']>;
  totalDebt?: Maybe<Scalars['BigInt']['output']>;
  totalDebtUsd?: Maybe<Scalars['Float']['output']>;
  totalIdle?: Maybe<Scalars['BigInt']['output']>;
  totalSupply?: Maybe<Scalars['BigInt']['output']>;
  tradeFactory?: Maybe<Scalars['String']['output']>;
  v3?: Maybe<Scalars['Boolean']['output']>;
  vault?: Maybe<Scalars['String']['output']>;
  want?: Maybe<Scalars['String']['output']>;
  yearn?: Maybe<Scalars['Boolean']['output']>;
};

export type kong_StrategyMeta = {
  description?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  protocols?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type kong_StrategyReport = {
  address: Scalars['String']['output'];
  apr?: Maybe<kong_ReportApr>;
  blockNumber: Scalars['Int']['output'];
  blockTime: Scalars['BigInt']['output'];
  chainId: Scalars['Int']['output'];
  debtOutstanding?: Maybe<Scalars['BigInt']['output']>;
  debtOutstandingUsd?: Maybe<Scalars['Float']['output']>;
  debtPayment?: Maybe<Scalars['BigInt']['output']>;
  debtPaymentUsd?: Maybe<Scalars['Float']['output']>;
  eventName: Scalars['String']['output'];
  logIndex: Scalars['Int']['output'];
  loss: Scalars['BigInt']['output'];
  lossUsd?: Maybe<Scalars['Float']['output']>;
  performanceFees?: Maybe<Scalars['BigInt']['output']>;
  performanceFeesUsd?: Maybe<Scalars['Float']['output']>;
  priceSource?: Maybe<Scalars['String']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
  profit: Scalars['BigInt']['output'];
  profitUsd?: Maybe<Scalars['Float']['output']>;
  protocolFees?: Maybe<Scalars['BigInt']['output']>;
  protocolFeesUsd?: Maybe<Scalars['Float']['output']>;
  transactionHash: Scalars['String']['output'];
};

export type kong_Thing = {
  address: Scalars['String']['output'];
  chainId: Scalars['Int']['output'];
  label: Scalars['String']['output'];
};

export type kong_TokenMeta = {
  category?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  displaySymbol?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type kong_Transfer = {
  address: Scalars['String']['output'];
  blockNumber: Scalars['BigInt']['output'];
  blockTime: Scalars['BigInt']['output'];
  chainId: Scalars['Int']['output'];
  logIndex: Scalars['Int']['output'];
  receiver: Scalars['String']['output'];
  sender: Scalars['String']['output'];
  transactionHash: Scalars['String']['output'];
  value: Scalars['Float']['output'];
  valueUsd?: Maybe<Scalars['Float']['output']>;
};

export type kong_Tvl = {
  address: Scalars['String']['output'];
  blockNumber: Scalars['Int']['output'];
  chainId: Scalars['Int']['output'];
  period: Scalars['String']['output'];
  priceSource: Scalars['String']['output'];
  priceUsd?: Maybe<Scalars['Float']['output']>;
  time?: Maybe<Scalars['BigInt']['output']>;
  value: Scalars['Float']['output'];
};

export type kong_Vault = {
  DOMAIN_SEPARATOR?: Maybe<Scalars['String']['output']>;
  FACTORY?: Maybe<Scalars['String']['output']>;
  accountant?: Maybe<Scalars['String']['output']>;
  activation?: Maybe<Scalars['BigInt']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  allocator?: Maybe<Scalars['String']['output']>;
  apiVersion?: Maybe<Scalars['String']['output']>;
  apy?: Maybe<kong_Apy>;
  asset?: Maybe<kong_Erc20>;
  availableDepositLimit?: Maybe<Scalars['BigInt']['output']>;
  category?: Maybe<Scalars['Int']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  creditAvailable?: Maybe<Scalars['BigInt']['output']>;
  debtOutstanding?: Maybe<Scalars['BigInt']['output']>;
  debtRatio?: Maybe<Scalars['BigInt']['output']>;
  debts?: Maybe<Array<Maybe<kong_Debt>>>;
  decimals?: Maybe<Scalars['BigInt']['output']>;
  depositLimit?: Maybe<Scalars['BigInt']['output']>;
  deposit_limit?: Maybe<Scalars['BigInt']['output']>;
  deposit_limit_module?: Maybe<Scalars['String']['output']>;
  emergencyShutdown?: Maybe<Scalars['Boolean']['output']>;
  erc4626?: Maybe<Scalars['Boolean']['output']>;
  expectedReturn?: Maybe<Scalars['BigInt']['output']>;
  fees?: Maybe<kong_Fees>;
  fullProfitUnlockDate?: Maybe<Scalars['BigInt']['output']>;
  future_role_manager?: Maybe<Scalars['String']['output']>;
  get_default_queue?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  governance?: Maybe<Scalars['String']['output']>;
  guardian?: Maybe<Scalars['String']['output']>;
  inceptBlock?: Maybe<Scalars['BigInt']['output']>;
  inceptTime?: Maybe<Scalars['BigInt']['output']>;
  isShutdown?: Maybe<Scalars['Boolean']['output']>;
  lastProfitUpdate?: Maybe<Scalars['BigInt']['output']>;
  lastReport?: Maybe<Scalars['BigInt']['output']>;
  lastReportDetail?: Maybe<kong_ReportDetail>;
  lockedProfit?: Maybe<Scalars['BigInt']['output']>;
  lockedProfitDegradation?: Maybe<Scalars['BigInt']['output']>;
  management?: Maybe<Scalars['String']['output']>;
  managementFee?: Maybe<Scalars['BigInt']['output']>;
  maxAvailableShares?: Maybe<Scalars['BigInt']['output']>;
  meta?: Maybe<kong_VaultMeta>;
  minimum_total_idle?: Maybe<Scalars['BigInt']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  performanceFee?: Maybe<Scalars['BigInt']['output']>;
  pricePerShare?: Maybe<Scalars['BigInt']['output']>;
  profitMaxUnlockTime?: Maybe<Scalars['BigInt']['output']>;
  profitUnlockingRate?: Maybe<Scalars['BigInt']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  projectName?: Maybe<Scalars['String']['output']>;
  registry?: Maybe<Scalars['String']['output']>;
  rewards?: Maybe<Scalars['String']['output']>;
  risk?: Maybe<kong_RiskScore>;
  role_manager?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<Maybe<kong_Role>>>;
  sparklines?: Maybe<kong_Sparklines>;
  strategies?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  symbol?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  totalAssets?: Maybe<Scalars['BigInt']['output']>;
  totalDebt?: Maybe<Scalars['BigInt']['output']>;
  totalIdle?: Maybe<Scalars['BigInt']['output']>;
  totalSupply?: Maybe<Scalars['BigInt']['output']>;
  total_supply?: Maybe<Scalars['BigInt']['output']>;
  tvl?: Maybe<kong_SparklinePoint>;
  unlockedShares?: Maybe<Scalars['BigInt']['output']>;
  use_default_queue?: Maybe<Scalars['Boolean']['output']>;
  v3?: Maybe<Scalars['Boolean']['output']>;
  vaultType?: Maybe<Scalars['Int']['output']>;
  withdraw_limit_module?: Maybe<Scalars['String']['output']>;
  withdrawalQueue?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  yearn?: Maybe<Scalars['Boolean']['output']>;
};

export type kong_VaultMeta = {
  description?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  displaySymbol?: Maybe<Scalars['String']['output']>;
  protocols?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  token?: Maybe<kong_TokenMeta>;
};

export type kong_VaultReport = {
  address: Scalars['String']['output'];
  apr?: Maybe<kong_ReportApr>;
  blockNumber: Scalars['Int']['output'];
  blockTime: Scalars['BigInt']['output'];
  chainId: Scalars['Int']['output'];
  currentDebt?: Maybe<Scalars['BigInt']['output']>;
  currentDebtUsd?: Maybe<Scalars['Float']['output']>;
  debtAdded?: Maybe<Scalars['BigInt']['output']>;
  debtAddedUsd?: Maybe<Scalars['Float']['output']>;
  debtPaid?: Maybe<Scalars['BigInt']['output']>;
  debtPaidUsd?: Maybe<Scalars['Float']['output']>;
  debtRatio?: Maybe<Scalars['BigInt']['output']>;
  eventName: Scalars['String']['output'];
  gain: Scalars['BigInt']['output'];
  gainUsd?: Maybe<Scalars['Float']['output']>;
  logIndex: Scalars['Int']['output'];
  loss: Scalars['BigInt']['output'];
  lossUsd?: Maybe<Scalars['Float']['output']>;
  priceSource?: Maybe<Scalars['String']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
  protocolFees?: Maybe<Scalars['BigInt']['output']>;
  protocolFeesUsd?: Maybe<Scalars['Float']['output']>;
  strategy: Scalars['String']['output'];
  totalDebt?: Maybe<Scalars['BigInt']['output']>;
  totalDebtUsd?: Maybe<Scalars['Float']['output']>;
  totalFees?: Maybe<Scalars['BigInt']['output']>;
  totalFeesUsd?: Maybe<Scalars['Float']['output']>;
  totalGain?: Maybe<Scalars['BigInt']['output']>;
  totalGainUsd?: Maybe<Scalars['Float']['output']>;
  totalLoss?: Maybe<Scalars['BigInt']['output']>;
  totalLossUsd?: Maybe<Scalars['Float']['output']>;
  totalRefunds?: Maybe<Scalars['BigInt']['output']>;
  totalRefundsUsd?: Maybe<Scalars['Float']['output']>;
  transactionHash: Scalars['String']['output'];
};

export type kong_VestingEscrowCreatedLog = {
  amount: Scalars['BigInt']['output'];
  chainId: Scalars['Int']['output'];
  cliffLength: Scalars['BigInt']['output'];
  escrow: Scalars['String']['output'];
  funder: Scalars['String']['output'];
  openClaim: Scalars['Boolean']['output'];
  recipient: Scalars['String']['output'];
  token: kong_Erc20;
  vestingDuration: Scalars['BigInt']['output'];
  vestingStart: Scalars['BigInt']['output'];
};

export type kong_GetVaultDataQueryVariables = Exact<{ [key: string]: never; }>;


export type kong_GetVaultDataQuery = { vaults?: Array<{ address?: string | null, symbol?: string | null, name?: string | null, chainId?: number | null, asset?: { decimals?: number | null, address?: string | null, name?: string | null, symbol?: string | null } | null } | null> | null };


export const GetVaultDataDocument = /*#__PURE__*/ gql`
    query GetVaultData {
  vaults(v3: true, yearn: true) {
    address
    symbol
    name
    chainId
    asset {
      decimals
      address
      name
      symbol
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetVaultData(variables?: kong_GetVaultDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<kong_GetVaultDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<kong_GetVaultDataQuery>(GetVaultDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetVaultData', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;