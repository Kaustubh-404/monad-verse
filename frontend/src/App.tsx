import { ConnectButton } from '@rainbow-me/rainbowkit'
import StatsBar from './components/StatsBar'
import PositionFeed from './components/PositionFeed'
import { VAULT_ADDRESS } from './config'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-sm">
              CE
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">CrowdEdge</h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5">Polymarket Intelligence on Monad</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://nad.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              $EDGE on nad.fun ↗
            </a>
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Agent running · Monad Testnet
          </div>
          <h2 className="text-3xl font-bold mb-2">
            AI Agent Trading{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Polymarket
            </span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Every trade decision is made by Llama 3.3 70B and published on-chain to Monad.
            Full transparency. Verifiable track record. No hidden signals.
          </p>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-200">Live Positions</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <a
                href={`https://testnet.monadexplorer.com/address/${VAULT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors font-mono"
              >
                {VAULT_ADDRESS.slice(0, 6)}...{VAULT_ADDRESS.slice(-4)} ↗
              </a>
              <span>·</span>
              <span>auto-refreshes every 30s</span>
            </div>
          </div>
          <PositionFeed />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-600">
          <span>CrowdEdge · Built for #Moltiverse Hackathon</span>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">GitHub</a>
            <a href="https://nad.fun" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">$EDGE</a>
            <a href={`https://testnet.monadexplorer.com/address/${VAULT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">Contract</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
