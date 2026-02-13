import type { OnChainPosition } from '../hooks/useVault'

interface Props {
  position: OnChainPosition
}

export default function PositionCard({ position }: Props) {
  const timeAgo = getTimeAgo(position.openedAt)
  // Old positions stored conditionId (0x...), new ones store the readable slug
  const isSlug = !position.marketId.startsWith('0x')
  const polymarketUrl = isSlug
    ? `https://polymarket.com/event/${position.marketId}`
    : `https://polymarket.com/search?q=${encodeURIComponent(position.marketQuestion.slice(0, 40))}`
  const explorerBase = 'https://testnet.monadexplorer.com'

  const actionColor = position.action === 'YES'
    ? 'bg-green-500/20 text-green-300 border-green-500/40'
    : 'bg-red-500/20 text-red-300 border-red-500/40'

  const statusBadge = () => {
    if (!position.resolved) return <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/30">Open</span>
    if (position.wasCorrect) return <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/30">✓ Won</span>
    return <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/30">✗ Lost</span>
  }

  const probBar = () => {
    const prob = position.entryProbability
    const color = prob > 60 ? 'bg-green-500' : prob > 40 ? 'bg-yellow-500' : 'bg-red-500'
    return (
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${prob}%` }} />
      </div>
    )
  }

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/40 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-white text-sm font-medium leading-snug flex-1 line-clamp-2">
          {position.marketQuestion}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${actionColor}`}>
            {position.action}
          </span>
          {statusBadge()}
        </div>
      </div>

      {/* Probability bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>YES probability at entry</span>
          <span className="font-mono">{position.entryProbability}%</span>
        </div>
        {probBar()}
      </div>

      {/* Reasoning */}
      <div className="bg-gray-900/50 rounded-lg p-2.5 mb-3 border border-gray-700/30">
        <p className="text-xs text-gray-300 leading-relaxed">
          <span className="text-purple-400 font-medium">AI: </span>
          {position.reasoning}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>${position.paperAmountUSD} paper</span>
          <span>·</span>
          <span>{timeAgo}</span>
          <span>·</span>
          <span className="font-mono">#{position.id}</span>
        </div>
        <div className="flex gap-2">
          <a
            href={polymarketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Polymarket ↗
          </a>
          <a
            href={`${explorerBase}/address/0xb9D42824955b492BE4cBf13988C3d0Ad9985F807#events`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            On-chain ↗
          </a>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
