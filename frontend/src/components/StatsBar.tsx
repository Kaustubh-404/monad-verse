import { useVaultStats } from '../hooks/useVault'

export default function StatsBar() {
  const { positionCount, winRate, totalResolved, totalWins } = useVaultStats()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Total Positions"
        value={positionCount.toString()}
        sub="on Monad testnet"
        color="purple"
      />
      <StatCard
        label="Win Rate"
        value={totalResolved > 0 ? `${winRate}%` : '—'}
        sub={totalResolved > 0 ? `${totalWins}/${totalResolved} resolved` : 'pending resolution'}
        color="green"
      />
      <StatCard
        label="Paper P&L"
        value={totalResolved > 0 ? `$${((totalWins * 10) - ((totalResolved - totalWins) * 10)).toFixed(0)}` : '$0'}
        sub="at $10/position"
        color="blue"
      />
      <StatCard
        label="Agent Status"
        value="LIVE"
        sub="every 5 minutes"
        color="emerald"
        pulse
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
  pulse = false,
}: {
  label: string
  value: string
  sub: string
  color: string
  pulse?: boolean
}) {
  const colors: Record<string, string> = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  }
  const textColors: Record<string, string> = {
    purple: 'text-purple-300',
    green: 'text-green-300',
    blue: 'text-blue-300',
    emerald: 'text-emerald-300',
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}
        <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
      </div>
      <p className="text-gray-500 text-xs mt-1">{sub}</p>
    </div>
  )
}
