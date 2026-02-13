import { useStrategies } from '../hooks/useStrategies'
import StrategyCard from './StrategyCard'
import TierBadge from './TierBadge'
import { STRATEGY_DAO_ADDRESS } from '../config'

export default function StrategiesPage() {
  const { strategies, count, loading } = useStrategies()

  return (
    <div>
      {/* Tier info */}
      <div className="mb-6">
        <TierBadge />
      </div>

      {/* Tier explanation */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { tier: 'Whale', tokens: '10,000+', delay: 'Instant', color: 'text-yellow-400' },
          { tier: 'Dolphin', tokens: '1,000+', delay: '24h', color: 'text-blue-400' },
          { tier: 'Shrimp', tokens: '100+', delay: '48h', color: 'text-green-400' },
          { tier: 'Public', tokens: '0', delay: '72h', color: 'text-gray-400' },
        ].map(t => (
          <div key={t.tier} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
            <p className={`text-sm font-bold ${t.color}`}>{t.tier}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t.tokens} $EDGE</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.delay} access</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-200">AI Strategies</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {count} strategies published on-chain
          </p>
        </div>
        <a
          href={`https://testnet.monadexplorer.com/address/${STRATEGY_DAO_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-300 font-mono transition-colors"
        >
          {STRATEGY_DAO_ADDRESS.slice(0, 6)}...{STRATEGY_DAO_ADDRESS.slice(-4)} ↗
        </a>
      </div>

      {/* Strategies */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm">No strategies published yet.</p>
          <p className="text-gray-600 text-xs mt-1">The agent publishes new strategies every 5 minutes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {strategies.map(s => (
            <StrategyCard key={Number(s.id)} strategy={s} />
          ))}
        </div>
      )}
    </div>
  )
}
