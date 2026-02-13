import { useReadContracts } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { useEffect, useState } from 'react'
import { VAULT_ADDRESS, VAULT_ABI, monadTestnet } from '../config'

export interface OnChainPosition {
  id: number
  marketId: string
  marketQuestion: string
  action: string
  entryProbability: number
  paperAmountUSD: number
  reasoning: string
  openedAt: number
  resolved: boolean
  wasCorrect: boolean
}

export function useVaultStats() {
  const { data, refetch } = useReadContracts({
    contracts: [
      { address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: 'getPositionCount' },
      { address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: 'getWinRate' },
      { address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: 'totalResolved' },
      { address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: 'totalWins' },
    ],
  })

  useEffect(() => {
    const interval = setInterval(() => refetch(), 30000)
    return () => clearInterval(interval)
  }, [refetch])

  return {
    positionCount: data?.[0]?.result ? Number(data[0].result) : 0,
    winRate: data?.[1]?.result ? Number(data[1].result) : 0,
    totalResolved: data?.[2]?.result ? Number(data[2].result) : 0,
    totalWins: data?.[3]?.result ? Number(data[3].result) : 0,
  }
}

export function usePositions(count: number) {
  const [positions, setPositions] = useState<OnChainPosition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (count === 0) {
      setLoading(false)
      return
    }

    const client = createPublicClient({
      chain: monadTestnet,
      transport: http(),
    })

    const fetchPositions = async () => {
      try {
        const ids = Array.from({ length: Math.min(count, 20) }, (_, i) => count - 1 - i).filter(id => id >= 0)

        const results = await Promise.all(
          ids.map(id =>
            client.readContract({
              address: VAULT_ADDRESS,
              abi: VAULT_ABI,
              functionName: 'getPosition',
              args: [BigInt(id)],
            })
          )
        )

        const parsed: OnChainPosition[] = results.map((r, i) => ({
          id: ids[i],
          marketId: r.marketId,
          marketQuestion: r.marketQuestion,
          action: r.action,
          entryProbability: Number(r.entryProbability),
          paperAmountUSD: Number(r.paperAmountUSD),
          reasoning: r.reasoning,
          openedAt: Number(r.openedAt),
          resolved: r.resolved,
          wasCorrect: r.wasCorrect,
        }))

        setPositions(parsed)
      } catch (err) {
        console.error('Error fetching positions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
    const interval = setInterval(fetchPositions, 30000)
    return () => clearInterval(interval)
  }, [count])

  return { positions, loading }
}
