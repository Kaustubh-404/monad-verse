interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon'
  children: React.ReactNode
  className?: string
}

export default function PremiumButton({
  variant = 'primary',
  children,
  className = '',
  ...props
}: PremiumButtonProps) {
  const baseStyles = 'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'gradient-cyan-purple text-white px-8 py-4 rounded-xl hover:scale-105 shadow-glow-mixed',
    secondary: 'bg-transparent border-2 border-transparent bg-gradient-to-r from-cyan-primary to-purple-secondary bg-clip-border text-white px-8 py-4 rounded-xl hover:bg-gradient-to-r hover:from-cyan-primary/10 hover:to-purple-secondary/10 hover:scale-105',
    icon: 'w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:scale-110 hover:bg-white/10'
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
