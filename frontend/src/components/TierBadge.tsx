import { useTier } from '../hooks/useTier'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const TIER_CONFIG = {
  1: { label: 'Whale', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', threshold: '10,000+ $EDGE', delay: 'Instant' },
  2: { label: 'Dolphin', color: 'text-blue-400',  bg: 'bg-blue-400/10 border-blue-400/30',  threshold: '1,000+ $EDGE',  delay: '24h delay' },
  3: { label: 'Shrimp',  color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', threshold: '100+ $EDGE',   delay: '48h delay' },
  4: { label: 'Public',  color: 'text-gray-400',  bg: 'bg-gray-400/10 border-gray-400/30',  threshold: 'No $EDGE',     delay: '72h delay' },
}

export default function TierBadge() {
  const { isConnected } = useAccount()
  const { tierInfo, loading } = useTier()

  if (!isConnected) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">Connect wallet to see your tier</p>
          <p className="text-xs text-gray-500 mt-0.5">Hold $EDGE tokens for earlier strategy access</p>
        </div>
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 animate-pulse h-16" />
    )
  }

  const config = TIER_CONFIG[tierInfo.tier as keyof typeof TIER_CONFIG]

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 flex items-center justify-between ${config.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`text-2xl font-bold ${config.color}`}>
          {config.label}
        </div>
        <div>
          <p className="text-sm text-gray-400">
            <span className="text-white font-medium">{tierInfo.edgeFormatted} $EDGE</span> · Tier {tierInfo.tier}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {config.delay} · {config.threshold} required
          </p>
        </div>
      </div>
      <a
        href="https://nad.fun"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-500/30 transition-colors"
      >
        Get $EDGE ↗
      </a>
    </div>
  )
}
