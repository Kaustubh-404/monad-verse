import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { useAccount } from 'wagmi'
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
  macroImplication: string
  riskLevel: string
  targetReturn: string
  defiActions: string
  publishedAt: bigint
  active: boolean
  // Enhanced access fields
  canAccess?: boolean
  unlockTime?: bigint
}

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { address, isConnected } = useAccount()

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

          let strategiesWithAccess = [...(latest as Strategy[])].reverse()

          // If wallet is connected, check access for each strategy
          if (isConnected && address) {
            strategiesWithAccess = await Promise.all(
              strategiesWithAccess.map(async (strategy) => {
                try {
                  const [canAccess, unlockTime] = await Promise.all([
                    client.readContract({
                      address: STRATEGY_DAO_ADDRESS,
                      abi: STRATEGY_DAO_ABI,
                      functionName: 'canAccess',
                      args: [strategy.id, address],
                    }),
                    client.readContract({
                      address: STRATEGY_DAO_ADDRESS,
                      abi: STRATEGY_DAO_ABI,
                      functionName: 'unlockTime',
                      args: [strategy.id, address],
                    }),
                  ])

                  return {
                    ...strategy,
                    canAccess: canAccess as boolean,
                    unlockTime: unlockTime as bigint,
                  }
                } catch (err) {
                  console.error(`Error checking access for strategy ${strategy.id}:`, err)
                  return strategy
                }
              })
            )
          }

          setStrategies(strategiesWithAccess)
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
  }, [address, isConnected])

  return { strategies, count, loading }
}
