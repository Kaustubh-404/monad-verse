import { defineChain } from 'viem'
import { http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { decimals: 18, name: 'Monad', symbol: 'MON' },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
})

export const wagmiConfig = getDefaultConfig({
  appName: 'CrowdEdge',
  projectId: 'crowdedge-hackathon',
  chains: [monadTestnet],
  transports: { [monadTestnet.id]: http() },
})

export const VAULT_ADDRESS = '0xb9D42824955b492BE4cBf13988C3d0Ad9985F807' as const
export const EDGE_TOKEN_ADDRESS = '0x43eb369A0F9c4C8c08716250152Cf16e76a795Ef' as const
export const STRATEGY_DAO_ADDRESS = '0x750EAe6D52dc0b0420A604C2d734B75d6814f41f' as const

// Full JSON ABI to handle tuple returns properly
export const VAULT_ABI = [
  {
    name: 'logPosition',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'marketId', type: 'string' },
      { name: 'question', type: 'string' },
      { name: 'action', type: 'string' },
      { name: 'entryProbability', type: 'uint256' },
      { name: 'reasoning', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'getWinRate',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getPositionCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalResolved',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalWins',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getPosition',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_id', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'marketId', type: 'string' },
          { name: 'marketQuestion', type: 'string' },
          { name: 'action', type: 'string' },
          { name: 'entryProbability', type: 'uint256' },
          { name: 'paperAmountUSD', type: 'uint256' },
          { name: 'reasoning', type: 'string' },
          { name: 'openedAt', type: 'uint256' },
          { name: 'resolved', type: 'bool' },
          { name: 'wasCorrect', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'PositionOpened',
    type: 'event',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'marketId', type: 'string', indexed: false },
      { name: 'action', type: 'string', indexed: false },
      { name: 'entryProbability', type: 'uint256', indexed: false },
      { name: 'reasoning', type: 'string', indexed: false },
    ],
  },
] as const

export const STRATEGY_DAO_ABI = [
  {
    name: 'getLatestStrategies',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'n', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'marketSlug', type: 'string' },
          { name: 'question', type: 'string' },
          { name: 'signal', type: 'string' },
          { name: 'probability', type: 'uint256' },
          { name: 'confidence', type: 'uint256' },
          { name: 'strategyType', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'publishedAt', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'getStrategyCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getTier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'canAccess',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'strategyId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'unlockTime',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'strategyId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'TIER1_THRESHOLD',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'TIER2_THRESHOLD',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'TIER3_THRESHOLD',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const EDGE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const
