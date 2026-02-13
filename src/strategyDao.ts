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

const STRATEGY_DAO_ABI = parseAbi([
  'function addStrategy(string _marketSlug, string _question, string _signal, uint256 _probability, uint256 _confidence, string _strategyType, string _description) external returns (uint256)',
  'function getStrategyCount() external view returns (uint256)'
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

export async function publishStrategy(analyzed: AnalyzedMarket): Promise<string> {
  const daoAddress = process.env.STRATEGY_DAO as `0x${string}`
  if (!daoAddress) throw new Error('STRATEGY_DAO not set in .env')

  const { walletClient, publicClient } = getClients()
  const { market, signal, prob } = analyzed

  const hash = await walletClient.writeContract({
    address: daoAddress,
    abi: STRATEGY_DAO_ABI,
    functionName: 'addStrategy',
    args: [
      market.slug.substring(0, 100),
      market.question.substring(0, 200),
      signal.action,
      BigInt(Math.round(prob)),
      BigInt(signal.confidence),
      signal.strategyType.substring(0, 30),
      signal.strategyDescription.substring(0, 500)
    ]
  })

  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}
