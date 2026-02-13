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
