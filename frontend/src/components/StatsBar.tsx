import { useVaultStats } from '../hooks/useVault'

export default function StatsBar() {
  const { positionCount, winRate, totalResolved, totalWins } = useVaultStats()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <StatCard
        label="Active Strategies"
        value={positionCount.toString()}
        sub="Published on-chain"
        gradient="from-purple-500/20 to-purple-600/10"
        icon="📊"
      />
      <StatCard
        label="Win Rate"
        value={totalResolved > 0 ? `${winRate}%` : '—'}
        sub={totalResolved > 0 ? `${totalWins}/${totalResolved} resolved` : 'Pending resolution'}
        gradient="from-emerald-500/20 to-emerald-600/10"
        textColor="text-emerald-300"
        icon="✓"
      />
      <StatCard
        label="Paper P&L"
        value={totalResolved > 0 ? `$${((totalWins * 10) - ((totalResolved - totalWins) * 10)).toFixed(0)}` : '$0'}
        sub="At $10/position"
        gradient="from-cyan-primary/20 to-blue-500/10"
        textColor="text-cyan-primary"
        icon="💰"
      />
      <StatCard
        label="Agent Status"
        value="LIVE"
        sub="Every 5 minutes"
        gradient="from-emerald-500/20 to-emerald-600/10"
        textColor="text-emerald-400"
        pulse
        icon="🤖"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  gradient,
  textColor = 'text-white',
  pulse = false,
  icon,
}: {
  label: string
  value: string
  sub: string
  gradient: string
  textColor?: string
  pulse?: boolean
  icon: string
}) {
  return (
    <div className={`glass bg-gradient-to-br ${gradient} border-gradient-left rounded-2xl p-6 hover-scale transition-premium animate-fade-in-up`}>
      {/* Icon & Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2 mb-2">
        {pulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>

      {/* Subtitle */}
      <p className="text-gray-500 text-xs font-medium">{sub}</p>
    </div>
  )
}
