import * as cron from 'node-cron'
import { fetchMarkets, filterMarkets } from './polymarket'
import { analyzeMarkets, pickTopSignals } from './llm'
import { getWalletAddress, getBalance } from './monad'
import { publishStrategy } from './strategyDao'
import { executeStrategy, simulateStrategy } from './defi-executor'

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

    // Step 4: Execute DeFi strategies and publish to StrategyDAO
    console.log('\n💼 Executing DeFi Strategies...')
    for (const signal of topSignals) {
      const { market, signal: s, prob } = signal

      console.log(`\n   📊 ${market.question.substring(0, 70)}...`)
      console.log(`      Probability: ${prob.toFixed(1)}% | Confidence: ${s.confidence}%`)
      console.log(`      Strategy: ${s.strategyType} (${s.riskLevel} risk)`)
      console.log(`      Expected Return: ${s.targetReturn}`)
      console.log(`\n      💡 Macro Implication:`)
      console.log(`         ${s.macroImplication}`)
      console.log(`\n      📋 Strategy:`)
      console.log(`         ${s.strategyDescription}`)

      // Simulate strategy first (dry run)
      if (s.defiActions && s.defiActions.length > 0) {
        simulateStrategy(s.defiActions)

        // Execute immediate actions
        console.log('      🚀 Executing immediate actions...')
        const txHashes = await executeStrategy(s.defiActions)

        if (txHashes.length > 0) {
          console.log(`      ✅ Executed ${txHashes.length} DeFi transaction(s)`)
          txHashes.forEach((hash, i) => {
            console.log(`         ${i + 1}. ${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`)
          })
        }
      } else {
        console.log('      ⚠️  No immediate DeFi actions to execute')
      }

      // Publish to StrategyDAO with full strategy details
      console.log('\n      ⛓️  Publishing to StrategyDAO...')
      const daoHash = await publishStrategy(signal)
      console.log(`      ✅ StrategyDAO TX: ${daoHash}`)
      console.log(`         View: https://testnet.monadexplorer.com/tx/${daoHash}`)
    }

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

  if (!process.env.STRATEGY_DAO) {
    console.error('❌ STRATEGY_DAO not set in .env — deploy the contract first!')
    process.exit(1)
  }

  console.log(`🏛️  StrategyDAO: ${process.env.STRATEGY_DAO}`)
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
