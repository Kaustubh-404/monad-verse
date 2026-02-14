import { useTier } from '../hooks/useTier'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const TIER_CONFIG = {
  1: { label: 'Whale', color: 'text-yellow-300', gradient: 'from-yellow-500/30 to-yellow-600/10', icon: '🐋', delay: 'Instant' },
  2: { label: 'Dolphin', color: 'text-blue-300', gradient: 'from-blue-500/30 to-blue-600/10', icon: '🐬', delay: '24h' },
  3: { label: 'Shrimp', color: 'text-green-300', gradient: 'from-green-500/30 to-green-600/10', icon: '🦐', delay: '48h' },
  4: { label: 'Public', color: 'text-gray-400', gradient: 'from-gray-500/20 to-gray-600/10', icon: '👤', delay: '72h' },
}

interface TierBadgeProps {
  compact?: boolean
}

export default function TierBadge({ compact = false }: TierBadgeProps) {
  const { isConnected } = useAccount()
  const { tierInfo, loading } = useTier()

  if (!isConnected && !compact) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-between animate-fade-in-up">
        <div>
          <p className="text-base font-semibold text-gray-200 mb-1">Connect wallet to see your tier</p>
          <p className="text-sm text-gray-400">Hold $STRATEGY tokens for earlier strategy access</p>
        </div>
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
    )
  }

  if (loading) {
    return compact ? (
      <div className="glass rounded-full px-4 py-2 w-32 h-10 animate-shimmer" />
    ) : (
      <div className="glass rounded-2xl p-6 h-20 animate-shimmer" />
    )
  }

  const config = TIER_CONFIG[tierInfo.tier as keyof typeof TIER_CONFIG]

  if (compact) {
    return (
      <div className={`glass rounded-full px-4 py-2 flex items-center gap-2 bg-gradient-to-r ${config.gradient} border border-white/10`}>
        <span className="text-base">{config.icon}</span>
        <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
        <span className="text-xs text-gray-400">· Tier {tierInfo.tier}</span>
      </div>
    )
  }

  return (
    <div className={`glass rounded-2xl p-6 flex items-center justify-between bg-gradient-to-r ${config.gradient} border border-white/10 animate-fade-in-up transition-premium hover-scale`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{config.icon}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-2xl font-bold ${config.color}`}>{config.label}</span>
            <span className="text-sm text-gray-400">Tier {tierInfo.tier}</span>
          </div>
          <p className="text-sm text-gray-300">
            <span className="font-semibold gradient-text-cyan-purple">{tierInfo.edgeFormatted} $STRATEGY</span>
            <span className="text-gray-500 mx-2">·</span>
            <span className="text-gray-400">{config.delay} access delay</span>
          </p>
        </div>
      </div>
      <a
        href="https://nad.fun"
        target="_blank"
        rel="noopener noreferrer"
        className="glass text-sm px-5 py-2.5 rounded-lg hover:bg-white/10 transition-fast font-semibold gradient-text-cyan-purple"
      >
        Get More ↗
      </a>
    </div>
  )
}
