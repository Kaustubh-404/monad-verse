import { ConnectButton } from '@rainbow-me/rainbowkit'
import StrategiesPage from './components/StrategiesPage'
import TierBadge from './components/TierBadge'
import { STRATEGY_DAO_ADDRESS } from './config'
import { useAccount } from 'wagmi'

export default function App() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-primary/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-secondary/10 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0E27]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Branding */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 gradient-cyan-purple rounded-xl flex items-center justify-center font-bold text-lg shadow-glow-mixed">
                SD
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none tracking-tight">StrategyDAO</h1>
                <p className="text-xs text-gray-400 leading-none mt-1">DeFi Alpha · Powered by AI</p>
              </div>
            </div>

            {/* Right side - Tier Badge + Connect */}
            <div className="flex items-center gap-4">
              {isConnected && (
                <div className="hidden lg:block">
                  <TierBadge compact />
                </div>
              )}
              <a
                href="https://nad.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-sm glass px-4 py-2 rounded-lg hover:bg-white/10 transition-fast font-medium"
              >
                <span className="gradient-text-cyan-purple font-semibold">Get $STRATEGY</span>
                <span className="text-cyan-primary">↗</span>
              </a>
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 glass text-emerald-400 text-xs px-4 py-2 rounded-full mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold">Agent Live · Publishing Every 5min · Monad Testnet</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up stagger-1">
            Get DeFi Alpha{' '}
            <span className="gradient-text-cyan-purple">
              Before Everyone Else
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2">
            AI-powered strategies from prediction markets, tiered access based on token holdings.
            Transform Polymarket signals into actionable DeFi strategies with on-chain verification.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <a
              href="https://nad.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-cyan-purple text-white font-semibold px-8 py-4 rounded-xl hover:scale-105 shadow-glow-mixed transition-all duration-200 text-base"
            >
              Buy $STRATEGY Token
            </a>
            <a
              href="#strategies"
              className="glass text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 hover:scale-105 transition-all duration-200 text-base"
            >
              View Strategies →
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="strategies" className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <StrategiesPage />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-24 bg-[#0A0E27]/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div>
              <span className="font-semibold gradient-text-cyan-purple">StrategyDAO</span>
              <span className="mx-2">·</span>
              <span>Built for #Moltiverse Hackathon</span>
            </div>
            <div className="flex gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://nad.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-primary transition-colors"
              >
                $STRATEGY
              </a>
              <a
                href={`https://testnet.monadexplorer.com/address/${STRATEGY_DAO_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-primary transition-colors font-mono text-xs"
              >
                Contract ↗
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
