import type { Strategy } from '../hooks/useStrategies'
import { useAccount } from 'wagmi'
import { useTier } from '../hooks/useTier'

const STRATEGY_COLORS: Record<string, string> = {
  RISK_OFF:   'bg-red-400/10 text-red-400 border-red-400/20',
  RISK_ON:    'bg-green-400/10 text-green-400 border-green-400/20',
  LONG_ETH:   'bg-blue-400/10 text-blue-400 border-blue-400/20',
  STABLE_YIELD: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  HEDGE:      'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  MOMENTUM:   'bg-purple-400/10 text-purple-400 border-purple-400/20',
  CONTRARIAN: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
}

interface Props {
  strategy: Strategy
}

function UnlockCountdown({ publishedAt, delayHours }: { publishedAt: bigint; delayHours: number }) {
  const unlockTs = Number(publishedAt) * 1000 + delayHours * 3600 * 1000
  const now = Date.now()
  const remaining = unlockTs - now

  if (remaining <= 0) return null

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  return (
    <span className="text-xs text-amber-400">
      Unlocks in {h}h {m}m
    </span>
  )
}

export default function StrategyCard({ strategy }: Props) {
  const { isConnected } = useAccount()
  const { tierInfo } = useTier()

  const publishedDate = new Date(Number(strategy.publishedAt) * 1000)
  const timeAgo = (() => {
    const diff = Date.now() - publishedDate.getTime()
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h > 0) return `${h}h ago`
    return `${m}m ago`
  })()

  // Delay in hours per tier
  const TIER_DELAY = [0, 0, 24, 48, 72]
  const delayHours = TIER_DELAY[tierInfo.tier] ?? 72
  const unlockTs = Number(strategy.publishedAt) * 1000 + delayHours * 3600 * 1000
  const isUnlocked = Date.now() >= unlockTs

  const signalColor = strategy.signal === 'YES' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
  const strategyColorClass = STRATEGY_COLORS[strategy.strategyType] ?? 'bg-gray-400/10 text-gray-400 border-gray-400/20'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${strategyColorClass}`}>
            {strategy.strategyType}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${signalColor}`}>
            {strategy.signal}
          </span>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">
            {Number(strategy.probability)}% prob
          </span>
          <span className="text-xs font-semibold text-white">
            {Number(strategy.confidence)}% conf
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-300 font-medium mb-3 leading-snug">
        {strategy.question}
      </p>

      {/* Strategy description — blurred if locked */}
      <div className={`relative ${!isUnlocked ? 'overflow-hidden' : ''}`}>
        <p className={`text-sm text-gray-400 leading-relaxed ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
          {strategy.description || 'No description available.'}
        </p>

        {!isUnlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-sm rounded">
            <p className="text-xs text-gray-400 font-medium mb-1">
              {isConnected ? `Tier ${tierInfo.tier} access` : 'Connect wallet'}
            </p>
            <UnlockCountdown publishedAt={strategy.publishedAt} delayHours={delayHours} />
            {!isConnected && (
              <p className="text-xs text-gray-500 mt-1">Connect to check your tier</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <a
          href={`https://polymarket.com/event/${strategy.marketSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          View on Polymarket ↗
        </a>
        <span className="text-xs text-gray-600 font-mono">
          #{Number(strategy.id)}
        </span>
      </div>
    </div>
  )
}
