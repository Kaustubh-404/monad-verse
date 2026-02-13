import { useVaultStats, usePositions } from '../hooks/useVault'
import PositionCard from './PositionCard'

export default function PositionFeed() {
  const { positionCount } = useVaultStats()
  const { positions, loading } = usePositions(positionCount)

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
            <div className="h-2 bg-gray-700 rounded w-full mb-3" />
            <div className="h-8 bg-gray-700 rounded w-full mb-3" />
            <div className="h-3 bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">🤖</p>
        <p className="text-lg font-medium text-gray-400">Agent is warming up</p>
        <p className="text-sm">First positions will appear within 5 minutes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {positions.map(position => (
        <PositionCard key={position.id} position={position} />
      ))}
    </div>
  )
}
