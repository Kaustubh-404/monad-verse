import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { useAccount } from 'wagmi'
import { monadTestnet, STRATEGY_DAO_ADDRESS, STRATEGY_DAO_ABI, EDGE_TOKEN_ADDRESS, EDGE_ABI } from '../config'

export interface TierInfo {
  tier: number         // 1-4
  edgeBalance: bigint  // raw balance
  edgeFormatted: string
}

export function useTier() {
  const { address } = useAccount()
  const [tierInfo, setTierInfo] = useState<TierInfo>({ tier: 4, edgeBalance: 0n, edgeFormatted: '0' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setTierInfo({ tier: 4, edgeBalance: 0n, edgeFormatted: '0' })
      return
    }

    async function load() {
      setLoading(true)
      try {
        const client = createPublicClient({
          chain: monadTestnet,
          transport: http(),
        })

        const [tier, balance] = await Promise.all([
          client.readContract({
            address: STRATEGY_DAO_ADDRESS,
            abi: STRATEGY_DAO_ABI,
            functionName: 'getTier',
            args: [address!],
          }),
          client.readContract({
            address: EDGE_TOKEN_ADDRESS,
            abi: EDGE_ABI,
            functionName: 'balanceOf',
            args: [address!],
          }),
        ])

        const bal = balance as bigint
        const formatted = (Number(bal) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 0 })

        setTierInfo({
          tier: Number(tier),
          edgeBalance: bal,
          edgeFormatted: formatted,
        })
      } catch (err) {
        console.error('useTier error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [address])

  return { tierInfo, loading }
}
