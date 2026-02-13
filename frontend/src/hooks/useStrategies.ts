import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { monadTestnet, STRATEGY_DAO_ADDRESS, STRATEGY_DAO_ABI } from '../config'

export interface Strategy {
  id: bigint
  marketSlug: string
  question: string
  signal: string
  probability: bigint
  confidence: bigint
  strategyType: string
  description: string
  publishedAt: bigint
  active: boolean
}

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const client = createPublicClient({
          chain: monadTestnet,
          transport: http(),
        })

        const total = await client.readContract({
          address: STRATEGY_DAO_ADDRESS,
          abi: STRATEGY_DAO_ABI,
          functionName: 'getStrategyCount',
        })

        setCount(Number(total))

        if (Number(total) > 0) {
          const latest = await client.readContract({
            address: STRATEGY_DAO_ADDRESS,
            abi: STRATEGY_DAO_ABI,
            functionName: 'getLatestStrategies',
            args: [BigInt(Math.min(Number(total), 20))],
          })
          // Reverse so newest is first
          setStrategies([...(latest as Strategy[])].reverse())
        }
      } catch (err) {
        console.error('useStrategies error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  return { strategies, count, loading }
}
