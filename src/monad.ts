import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { decimals: 18, name: 'Monad', symbol: 'MON' },
  rpcUrls: {
    default: { http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] },
    public: { http: [process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] }
  }
} as const

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
