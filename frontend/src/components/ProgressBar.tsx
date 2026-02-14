interface ProgressBarProps {
  value: number // 0-100
  className?: string
  gradient?: boolean
}

export default function ProgressBar({ value, className = '', gradient = true }: ProgressBarProps) {
  const fillClass = gradient ? 'gradient-cyan-purple-horizontal' : 'bg-cyan-primary'

  return (
    <div className={`w-full h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${fillClass} transition-all duration-500 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
