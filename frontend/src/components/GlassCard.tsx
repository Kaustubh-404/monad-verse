interface GlassCardProps {
  children: React.ReactNode
  className?: string
  accentPosition?: 'left' | 'top' | 'none'
  hoverable?: boolean
  padding?: string
}

export default function GlassCard({
  children,
  className = '',
  accentPosition = 'none',
  hoverable = false,
  padding = 'p-6'
}: GlassCardProps) {
  const accentClasses = {
    left: 'border-gradient-left',
    top: 'border-gradient-top',
    none: ''
  }

  const hoverClass = hoverable ? 'hover-scale hover-glow cursor-pointer' : ''

  return (
    <div className={`glass rounded-2xl ${padding} ${accentClasses[accentPosition]} ${hoverClass} transition-premium ${className}`}>
      {children}
    </div>
  )
}
