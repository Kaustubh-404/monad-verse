import { ConnectButton } from '@rainbow-me/rainbowkit'
import StrategiesPage from './components/StrategiesPage'
import { STRATEGY_DAO_ADDRESS } from './config'

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
              <p className="text-xs text-gray-500 leading-none mt-0.5">AI Prediction Market Strategies on Monad</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://nad.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              Get $EDGE ↗
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
            Agent live · publishing every 5 min · Monad Testnet
          </div>
          <h2 className="text-3xl font-bold mb-2">
            AI-Generated{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DeFi Strategies
            </span>
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Our AI agent scans Polymarket in real-time, finds mispriced prediction markets,
            and tells you exactly what to do — bet YES or NO and why.
            Hold <span className="text-purple-300 font-medium">$EDGE</span> tokens to unlock strategies before everyone else.
          </p>
        </div>

        <StrategiesPage />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-600">
          <span>CrowdEdge · Built for #Moltiverse Hackathon</span>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">GitHub</a>
            <a href="https://nad.fun" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">$EDGE</a>
            <a
              href={`https://testnet.monadexplorer.com/address/${STRATEGY_DAO_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400"
            >
              Contract
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
