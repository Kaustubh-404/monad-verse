import type { Strategy } from '../hooks/useStrategies'
import { useAccount } from 'wagmi'
import { useTier } from '../hooks/useTier'

const STRATEGY_COLORS: Record<string, string> = {
  RISK_OFF:     'bg-red-400/10 text-red-400 border-red-400/20',
  RISK_ON:      'bg-green-400/10 text-green-400 border-green-400/20',
  LONG_ETH:     'bg-blue-400/10 text-blue-400 border-blue-400/20',
  STABLE_YIELD: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  HEDGE:        'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  MOMENTUM:     'bg-purple-400/10 text-purple-400 border-purple-400/20',
  CONTRARIAN:   'bg-orange-400/10 text-orange-400 border-orange-400/20',
}

interface Props {
  strategy: Strategy
}

function timeAgo(ts: bigint): string {
  const diff = Date.now() - Number(ts) * 1000
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

function UnlockCountdown({ publishedAt, delayHours }: { publishedAt: bigint; delayHours: number }) {
  const unlockTs = Number(publishedAt) * 1000 + delayHours * 3600 * 1000
  const remaining = unlockTs - Date.now()
  if (remaining <= 0) return null
  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  return <span className="font-medium text-amber-300">Unlocks in {h}h {m}m</span>
}

export default function StrategyCard({ strategy }: Props) {
  const { isConnected } = useAccount()
  const { tierInfo } = useTier()

  const TIER_DELAY = [0, 0, 24, 48, 72]
  const delayHours = TIER_DELAY[tierInfo.tier] ?? 72
  const isUnlocked = Date.now() >= Number(strategy.publishedAt) * 1000 + delayHours * 3600 * 1000

  const isYes = strategy.signal === 'YES'
  const signalBg = isYes
    ? 'bg-emerald-500 text-white'
    : 'bg-red-500 text-white'
  const strategyColorClass = STRATEGY_COLORS[strategy.strategyType] ?? 'bg-gray-400/10 text-gray-400 border-gray-400/20'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
      {/* Top bar — action + meta */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-800">
        {/* BIG signal badge */}
        <span className={`text-sm font-bold px-3 py-1 rounded-lg shrink-0 ${signalBg}`}>
          BET {strategy.signal}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug truncate">
            {strategy.question}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500">
          <span>{timeAgo(strategy.publishedAt)}</span>
          <span>·</span>
          <span className="text-white font-semibold">{Number(strategy.confidence)}% conf</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 px-5 py-2 bg-gray-950/50 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Crowd says:</span>
          <span className="text-white font-medium">{Number(strategy.probability)}% YES</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">AI says:</span>
          <span className={`font-bold ${isYes ? 'text-emerald-400' : 'text-red-400'}`}>
            {isYes ? 'Undervalued YES' : 'Overvalued YES'}
          </span>
        </div>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded border ${strategyColorClass}`}>
          {strategy.strategyType}
        </span>
      </div>

      {/* Description — the actionable instruction */}
      <div className="px-5 py-4">
        <div className={`relative ${!isUnlocked ? 'overflow-hidden' : ''}`}>
          {/* Label */}
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1.5">
            What to do
          </p>

          <p className={`text-sm text-gray-200 leading-relaxed ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
            {strategy.description || 'No description available.'}
          </p>

          {/* Lock overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <p className="text-2xl mb-1">🔒</p>
                <p className="text-xs text-gray-400 mb-1">
                  {isConnected
                    ? `Tier ${tierInfo.tier} — strategy locked`
                    : 'Connect wallet to check your tier'}
                </p>
                <UnlockCountdown publishedAt={strategy.publishedAt} delayHours={delayHours} />
                {!isConnected && (
                  <p className="text-xs text-gray-600 mt-1">
                    Hold $EDGE tokens for earlier access
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer — link */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <a
          href={`https://polymarket.com/event/${strategy.marketSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors font-medium"
        >
          Open on Polymarket ↗
        </a>
        <span className="text-xs text-gray-700 font-mono">#{Number(strategy.id)}</span>
      </div>
    </div>
  )
}
