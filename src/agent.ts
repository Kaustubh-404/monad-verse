import * as cron from 'node-cron'
import { fetchMarkets, filterMarkets } from './polymarket'
import { analyzeMarkets, pickTopSignals } from './llm'
import { publishPosition, getWalletAddress, getBalance, getOnChainStats } from './monad'

async function runCycle() {
  console.log('\n' + '═'.repeat(60))
  console.log(`🤖 CrowdEdge | ${new Date().toLocaleString()}`)
  console.log('═'.repeat(60))

  try {
    // Step 1: Fetch Polymarket data
    console.log('\n📡 Fetching Polymarket markets...')
    const allMarkets = await fetchMarkets(100)
    const filtered = filterMarkets(allMarkets)
    console.log(`   Fetched: ${allMarkets.length} | After filter: ${filtered.length}`)

    if (filtered.length === 0) {
      console.log('   No markets pass filter. Skipping cycle.')
      return
    }

    // Step 2: LLM analysis (analyze top 20 to keep costs minimal)
    const toAnalyze = filtered.slice(0, 20)
    const analyzed = await analyzeMarkets(toAnalyze)
    console.log(`   LLM analyzed: ${analyzed.length} | Tradeable: ${analyzed.filter(a => a.signal.trade).length}`)

    // Step 3: Pick top signals
    const topSignals = pickTopSignals(analyzed, 3)
    console.log(`   Top signals (confidence ≥65%): ${topSignals.length}`)

    if (topSignals.length === 0) {
      console.log('   No high-confidence signals this cycle.')
      return
    }

    // Step 4: Publish to Monad
    console.log('\n⛓️  Publishing to Monad testnet...')
    for (const signal of topSignals) {
      const { market, signal: s, prob } = signal
      console.log(`\n   📊 ${market.question.substring(0, 60)}...`)
      console.log(`      Action: ${s.action} | Confidence: ${s.confidence}% | Prob: ${prob.toFixed(1)}%`)
      console.log(`      Reasoning: ${s.reasoning}`)

      const hash = await publishPosition(signal)
      console.log(`      ✅ TX: ${hash}`)
      console.log(`         https://testnet.monadexplorer.com/tx/${hash}`)
    }

    // Step 5: Print on-chain stats
    const stats = await getOnChainStats()
    console.log(`\n📈 On-chain stats: ${stats.positionCount} positions | Win rate: ${stats.winRate}%`)

  } catch (err) {
    console.error('❌ Cycle error:', err)
  }

  console.log('\n⏳ Next cycle in 5 minutes...')
}

async function main() {
  console.log('🚀 CrowdEdge Agent Starting...')

  const address = await getWalletAddress()
  const balance = await getBalance()
  console.log(`💼 Wallet: ${address}`)
  console.log(`💰 Balance: ${balance} MON`)

  if (parseFloat(balance) < 0.01) {
    console.warn('⚠️  Low balance! Get testnet MON from https://faucet.monad.xyz')
  }

  if (!process.env.VAULT_CONTRACT) {
    console.error('❌ VAULT_CONTRACT not set in .env — deploy the contract first!')
    process.exit(1)
  }

  console.log(`📄 Vault: ${process.env.VAULT_CONTRACT}`)
  console.log('🔗 Network: Monad Testnet')
  console.log('\nStarting first cycle immediately...\n')

  // Run immediately on start
  await runCycle()

  // Then every 5 minutes
  cron.schedule('*/5 * * * *', runCycle)
  console.log('✅ Agent running. Press Ctrl+C to stop.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
