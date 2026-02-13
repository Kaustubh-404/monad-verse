import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { AnalyzedMarket } from './types'

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { decimals: 18, name: 'Monad', symbol: 'MON' },
  rpcUrls: {
    default: { http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] },
    public:  { http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] }
  }
} as const

const VAULT_ABI = parseAbi([
  'function logPosition(string marketId, string question, string action, uint256 entryProbability, string reasoning) external',
  'function resolvePosition(uint256 id, bool wasCorrect) external',
  'function getWinRate() external view returns (uint256)',
  'function getPositionCount() external view returns (uint256)',
  'event PositionOpened(uint256 indexed id, string marketId, string action, uint256 confidence, string reasoning)'
])

function getClients() {
  const rawKey = process.env.PRIVATE_KEY || ''
  const key = (rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`) as `0x${string}`
  const account = privateKeyToAccount(key)

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http()
  })

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http()
  })

  return { walletClient, publicClient, account }
}

export async function getWalletAddress(): Promise<string> {
  const { account } = getClients()
  return account.address
}

export async function getBalance(): Promise<string> {
  const { publicClient, account } = getClients()
  const balance = await publicClient.getBalance({ address: account.address })
  return (Number(balance) / 1e18).toFixed(4)
}

export async function publishPosition(analyzed: AnalyzedMarket): Promise<string> {
  const vaultAddress = process.env.VAULT_CONTRACT as `0x${string}`
  if (!vaultAddress) throw new Error('VAULT_CONTRACT not set in .env')

  const { walletClient, publicClient } = getClients()
  const { market, signal, prob } = analyzed

  const question = market.question.substring(0, 200)
  const reasoning = signal.reasoning.substring(0, 300)
  const entryProb = BigInt(Math.round(prob))

  const hash = await walletClient.writeContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'logPosition',
    args: [market.slug, question, signal.action, entryProb, reasoning]  // slug → readable Polymarket URL
  })

  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

export async function getOnChainStats(): Promise<{ winRate: number; positionCount: number }> {
  const vaultAddress = process.env.VAULT_CONTRACT as `0x${string}`
  if (!vaultAddress) return { winRate: 0, positionCount: 0 }

  const { publicClient } = getClients()

  const [winRate, positionCount] = await Promise.all([
    publicClient.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'getWinRate' }),
    publicClient.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: 'getPositionCount' })
  ])

  return {
    winRate: Number(winRate),
    positionCount: Number(positionCount)
  }
}
