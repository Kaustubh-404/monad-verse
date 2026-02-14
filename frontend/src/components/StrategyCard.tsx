import type { Strategy } from '../hooks/useStrategies'
import { useAccount } from 'wagmi'
import { useTier } from '../hooks/useTier'
import AccessStatus from './AccessStatus'
import ProgressBar from './ProgressBar'
import { useEffect, useState, useMemo } from 'react'

const STRATEGY_COLORS: Record<string, string> = {
  RISK_OFF: 'bg-red-400/10 text-red-400 border-red-400/20',
  RISK_ON: 'bg-green-400/10 text-green-400 border-green-400/20',
  LONG_ETH: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  ETH_LONG: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  STABLE_YIELD: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  HEDGE: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  MOMENTUM: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  CONTRARIAN: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
}

const RISK_LEVEL_COLORS: Record<string, { bg: string; text: string; emoji: string; border: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', emoji: '✓', border: 'border-emerald-500/30' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', emoji: '⚡', border: 'border-amber-500/30' },
  high: { bg: 'bg-rose-500/10', text: 'text-rose-400', emoji: '⚠️', border: 'border-rose-500/30' },
}

interface DefiAction {
  protocol: string
  action?: string
  actionType?: string
  asset?: string
  fromAsset?: string
  toAsset?: string
  allocation?: string
  timing?: string
  priority?: number
  params?: Record<string, any>
}

interface ParsedStrategy {
  cleanDescription: string
  metadata?: {
    macroImplication?: string
    riskLevel?: string
    targetReturn?: string
    defiActions?: DefiAction[]
  }
}

function parseStrategyDescription(description: string, contractMacro: string, contractRisk: string, contractReturn: string, contractActions: string): ParsedStrategy {
  // Check if description contains embedded metadata (legacy format)
  if (description.includes('||METADATA:')) {
    const [cleanDesc, metadataStr] = description.split('||METADATA:')
    try {
      const metadata = JSON.parse(metadataStr)
      return {
        cleanDescription: cleanDesc.trim(),
        metadata: {
          macroImplication: metadata.macroImplication || contractMacro,
          riskLevel: metadata.riskLevel || contractRisk,
          targetReturn: metadata.targetReturn || contractReturn,
          defiActions: metadata.defiActions || [],
        }
      }
    } catch (e) {
      console.error('Failed to parse embedded metadata:', e)
      return { cleanDescription: cleanDesc.trim() }
    }
  }

  // Use contract fields
  let actions: DefiAction[] = []
  try {
    if (contractActions && contractActions !== '[]') {
      actions = JSON.parse(contractActions)
    }
  } catch (e) {
    console.error('Failed to parse contract defiActions:', e)
  }

  return {
    cleanDescription: description,
    metadata: {
      macroImplication: contractMacro,
      riskLevel: contractRisk,
      targetReturn: contractReturn,
      defiActions: actions,
    }
  }
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

function UnlockCountdown({ unlockTime }: { unlockTime: bigint }) {
  const [countdown, setCountdown] = useState<string>('')

  useEffect(() => {
    function updateCountdown() {
      const now = Math.floor(Date.now() / 1000)
      const unlock = Number(unlockTime)
      const remaining = unlock - now

      if (remaining <= 0) {
        setCountdown('')
        return
      }

      const h = Math.floor(remaining / 3600)
      const m = Math.floor((remaining % 3600) / 60)
      setCountdown(`${h}h ${m}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [unlockTime])

  if (!countdown) return null

  return <span className="font-medium text-amber-300">Unlocks in {countdown}</span>
}

export default function StrategyCard({ strategy }: Props) {
  const { isConnected } = useAccount()
  const { tierInfo } = useTier()

  // Parse strategy data
  const parsed = useMemo(() => parseStrategyDescription(
    strategy.description || '',
    strategy.macroImplication || '',
    strategy.riskLevel || 'medium',
    strategy.targetReturn || '',
    strategy.defiActions || '[]'
  ), [strategy])

  // Use contract-provided access data if available, fallback to manual calculation
  const isUnlocked = strategy.canAccess ?? (
    Date.now() >= Number(strategy.publishedAt) * 1000 +
    ([0, 0, 24, 48, 72][tierInfo.tier] ?? 72) * 3600 * 1000
  )

  const isYes = strategy.signal === 'YES'
  const signalBg = isYes
    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
    : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20'

  const strategyColorClass = STRATEGY_COLORS[strategy.strategyType] ?? 'bg-gray-400/10 text-gray-400 border-gray-400/20'

  // Get risk level styling
  const riskLevel = parsed.metadata?.riskLevel?.toLowerCase() || 'medium'
  const riskStyle = RISK_LEVEL_COLORS[riskLevel] || RISK_LEVEL_COLORS.medium

  const defiActions = parsed.metadata?.defiActions || []

  return (
    <div className="glass rounded-2xl overflow-hidden hover-scale hover-glow transition-premium animate-fade-in-up border border-white/10">
      {/* Top bar — action + meta */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
        {/* Signal badge with gradient */}
        <span className={`text-sm font-bold px-4 py-2.5 rounded-xl shrink-0 shadow-lg ${signalBg}`}>
          BET {strategy.signal}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white leading-snug">
            {strategy.question}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs text-gray-400">
          <span>{timeAgo(strategy.publishedAt)}</span>
          <span>·</span>
          <span className="text-cyan-primary font-bold">{Number(strategy.confidence)}% conf</span>
        </div>
      </div>

      {/* Stats row with probability bar */}
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Market:</span>
              <span className="text-white font-semibold">{Number(strategy.probability)}% YES</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">AI Signal:</span>
              <span className={`font-bold ${isYes ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isYes ? 'Undervalued ↗' : 'Overvalued ↘'}
              </span>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${strategyColorClass}`}>
            {strategy.strategyType}
          </span>
        </div>
        <ProgressBar value={Number(strategy.probability)} gradient />
      </div>

      {/* Risk & Return info */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-white/[0.02] to-transparent border-b border-white/5">
        <div className={`flex items-center gap-2 glass ${riskStyle.bg} ${riskStyle.text} border ${riskStyle.border} px-4 py-2 rounded-xl text-xs font-bold shadow-sm`}>
          <span className="text-base">{riskStyle.emoji}</span>
          <span className="capitalize">{parsed.metadata?.riskLevel || 'Medium'} Risk</span>
        </div>
        {parsed.metadata?.targetReturn && parsed.metadata.targetReturn !== 'TBD' && (
          <div className="flex items-center gap-2 glass bg-blue-500/10 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
            <span className="text-base">📈</span>
            <span>{parsed.metadata.targetReturn}</span>
          </div>
        )}
      </div>

      {/* Macro Implication */}
      {parsed.metadata?.macroImplication && parsed.metadata.macroImplication.length > 0 && (
        <div className="px-6 py-5 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🌐</span>
            <p className="text-xs gradient-text-cyan-purple font-bold uppercase tracking-wider">Macro Implication</p>
          </div>
          <p className={`text-sm text-gray-100 leading-relaxed ${!isUnlocked ? 'blur-md select-none' : ''}`}>
            {parsed.metadata.macroImplication}
          </p>
        </div>
      )}

      {/* Description — the actionable instruction */}
      <div className="px-6 py-6 bg-white/[0.01]">
        <div className={`relative ${!isUnlocked ? 'overflow-hidden min-h-[150px]' : ''}`}>
          {/* Label and Access Status */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs gradient-text-cyan-purple uppercase tracking-wider font-bold flex items-center gap-2">
              <span className="text-lg">💡</span>
              Strategy Recommendation
            </p>
            <AccessStatus
              canAccess={strategy.canAccess}
              unlockTime={strategy.unlockTime}
              isConnected={isConnected}
            />
          </div>

          <p className={`text-sm text-gray-100 leading-relaxed ${!isUnlocked ? 'blur-lg select-none' : ''}`}>
            {parsed.cleanDescription || 'No description available.'}
          </p>

          {/* Premium Lock overlay with gradient */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center glass-strong rounded-xl border border-white/20 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-primary/10">
              <div className="text-center px-4">
                <div className="text-5xl mb-4 animate-pulse-glow">🔒</div>
                <p className="text-base text-white mb-2 font-bold">
                  {isConnected
                    ? `Tier ${tierInfo.tier} Access Required`
                    : 'Connect Wallet to View'}
                </p>
                {strategy.unlockTime && (
                  <div className="mb-3">
                    <UnlockCountdown unlockTime={strategy.unlockTime} />
                  </div>
                )}
                {!isConnected && (
                  <p className="text-xs text-gray-400 mt-3">
                    Hold $STRATEGY tokens for earlier access
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DeFi Actions */}
      {isUnlocked && defiActions.length > 0 && (
        <div className="px-6 py-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-t border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <p className="text-xs gradient-text-cyan-purple font-bold uppercase tracking-wider">
              DeFi Action Plan
            </p>
          </div>
          <div className="space-y-3">
            {defiActions.map((action, idx) => (
              <div key={idx} className="glass rounded-xl p-4 hover:bg-white/5 transition-fast border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold gradient-text-cyan-purple">{action.protocol}</span>
                    {action.priority !== undefined && (
                      <span className="text-xs glass bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full font-semibold">
                        P{action.priority}
                      </span>
                    )}
                  </div>
                  <span className="text-xs glass text-cyan-primary px-3 py-1 rounded-lg capitalize font-semibold">
                    {action.action || action.actionType}
                  </span>
                </div>

                <div className="space-y-2">
                  {(action.asset || action.fromAsset) && (
                    <p className="text-xs text-gray-400">
                      Asset: <span className="text-white font-semibold">{action.asset || `${action.fromAsset} → ${action.toAsset}`}</span>
                    </p>
                  )}
                  {action.allocation && (
                    <p className="text-xs text-gray-400">
                      Allocation: <span className="text-emerald-400 font-bold">{action.allocation}</span>
                    </p>
                  )}
                  {action.timing && (
                    <p className="text-xs text-gray-400">
                      Timing: <span className="text-amber-400 font-semibold capitalize">{action.timing}</span>
                    </p>
                  )}
                  {action.params && Object.keys(action.params).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(action.params).map(([key, value]) => (
                        <span key={key} className="text-xs glass bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/10">
                          {key}: <span className="text-white font-semibold">{String(value)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer — link */}
      <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent border-t border-white/5">
        <a
          href={`https://polymarket.com/event/${strategy.marketSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs glass px-5 py-2.5 rounded-lg hover:bg-white/10 transition-fast font-semibold gradient-text-cyan-purple border border-white/10"
        >
          <span>View on Polymarket</span>
          <span className="text-cyan-primary">↗</span>
        </a>
        <span className="text-xs text-gray-500 font-mono">#{Number(strategy.id)}</span>
      </div>
    </div>
  )
}
