import { useStrategies } from '../hooks/useStrategies'
import StrategyCard from './StrategyCard'
import TierBadge from './TierBadge'
import StatsBar from './StatsBar'
import { useTier } from '../hooks/useTier'
import { STRATEGY_DAO_ADDRESS } from '../config'

export default function StrategiesPage() {
  const { strategies, count, loading } = useStrategies()
  const { tierInfo } = useTier()

  return (
    <div>
      {/* Stats Grid */}
      <StatsBar />

      {/* Tier Info Card */}
      <div className="mb-8">
        <TierBadge />
      </div>

      {/* Tier Benefits Grid */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-6 gradient-text-cyan-purple">Token Tier Benefits</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tier: 1, name: 'Whale', icon: '🐋', tokens: '10,000+', delay: 'Instant', color: 'yellow' },
            { tier: 2, name: 'Dolphin', icon: '🐬', tokens: '1,000+', delay: '24h', color: 'blue' },
            { tier: 3, name: 'Shrimp', icon: '🦐', tokens: '100+', delay: '48h', color: 'green' },
            { tier: 4, name: 'Public', icon: '👤', tokens: '0', delay: '72h', color: 'gray' },
          ].map(t => {
            const isCurrentTier = t.tier === tierInfo.tier
            const gradients: Record<string, string> = {
              yellow: 'from-yellow-500/20 to-yellow-600/10',
              blue: 'from-blue-500/20 to-blue-600/10',
              green: 'from-green-500/20 to-green-600/10',
              gray: 'from-gray-500/15 to-gray-600/10',
            }

            return (
              <div
                key={t.tier}
                className={`glass rounded-2xl p-5 text-center transition-premium bg-gradient-to-br ${gradients[t.color]}
                  ${isCurrentTier ? 'border-2 border-cyan-primary shadow-glow-cyan scale-105' : 'border border-white/10 hover-scale'}
                `}
              >
                <div className="text-3xl mb-2">{t.icon}</div>
                <p className={`text-lg font-bold mb-1 ${isCurrentTier ? 'gradient-text-cyan-purple' : 'text-white'}`}>
                  {t.name}
                </p>
                <p className="text-xs text-gray-400 mb-2">{t.tokens} $STRATEGY</p>
                <p className="text-sm text-gray-300 font-semibold">{t.delay} access</p>
                {isCurrentTier && (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs bg-cyan-primary/20 text-cyan-primary px-2 py-1 rounded-full font-bold">
                    <span>✓</span>
                    <span>Your Tier</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Strategies Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Available Strategies</h3>
          <p className="text-sm text-gray-400">
            {count} {count === 1 ? 'strategy' : 'strategies'} published on-chain
          </p>
        </div>
        <a
          href={`https://testnet.monadexplorer.com/address/${STRATEGY_DAO_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass text-xs text-gray-400 hover:text-cyan-primary font-mono px-4 py-2 rounded-lg transition-fast"
        >
          {STRATEGY_DAO_ADDRESS.slice(0, 6)}...{STRATEGY_DAO_ADDRESS.slice(-4)} ↗
        </a>
      </div>

      {/* Strategies List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-8 animate-shimmer h-64" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-xl text-gray-300 mb-2">No strategies published yet</p>
          <p className="text-sm text-gray-500">The agent publishes new strategies every 5 minutes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strategies.map((s, idx) => (
            <div key={Number(s.id)} className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)}`}>
              <StrategyCard strategy={s} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
