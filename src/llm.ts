import Groq from 'groq-sdk'
import { Market, LLMSignal, AnalyzedMarket } from './types'
import { getProbability } from './polymarket'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function analyzeMarket(market: Market): Promise<AnalyzedMarket | null> {
  const prob = getProbability(market)
  const volume = market.volume24hr || 0
  const liquidity = parseFloat(market.liquidity || '0')

  const prompt = `You are a DeFi strategist analyzing prediction markets to generate actionable crypto trading strategies.

Market Prediction: "${market.question}"
Current YES probability: ${prob.toFixed(1)}%
24h Volume: $${volume.toLocaleString()}
Liquidity: $${liquidity.toLocaleString()}

YOUR TASK: Analyze what this prediction means for crypto markets and generate a concrete DeFi strategy.

CRITICAL RULES:
1. DO NOT recommend betting on Polymarket - instead, use this prediction to inform DeFi trading decisions
2. Focus on MACRO IMPLICATIONS: What does this outcome mean for crypto asset prices, yields, and risk appetite?
3. Generate CONCRETE DeFi actions using real protocols (Uniswap, Aave, Lido, Compound, Curve)
4. Only recommend if you have genuine conviction (confidence ≥ 65%)
5. Avoid markets between 40-60% (too uncertain) or below 5%/above 95% (near-expired)
6. Look for mispricing in the 10-40% or 60-90% range where there's actionable signal

STRATEGY FRAMEWORK:

**Fed/Macro Events:**
- Rate cuts (high prob) → Risk-on play → Long stablecoins now, prepare to rotate to ETH/yield assets
- Rate hikes → Risk-off → Exit farms, stake stables for safe yield
- Recession signals → Preserve capital → Lend stables on Aave, reduce leverage

**Crypto-Specific Events:**
- ETF approval → Institutional buying → Long ETH, provide liquidity on DEXs
- Regulatory crackdown → Risk-off → Withdraw from risky protocols, bridge to safer chains
- Network upgrade success → Ecosystem bullish → Long governance tokens, farm new protocols
- Hack/exploit prediction → Exit affected protocols immediately

**Market Sentiment:**
- Bull market indicators → Increase exposure, use leverage carefully, farm high APY
- Bear market signals → Stake stables, reduce positions, wait for opportunities

RESPONSE FORMAT (JSON only, no other text):
{
  "trade": true/false,
  "action": "YES/NO",
  "confidence": 0-100,
  "reasoning": "one sentence - why this matters for crypto",
  "strategyType": "RATE_CUT_PLAY / RISK_OFF / ETH_LONG / STABLE_YIELD / LEVERAGE / ECOSYSTEM_PLAY",
  "strategyDescription": "2-3 sentences explaining the complete strategy from entry to exit",
  "macroImplication": "what this prediction means for crypto markets (1 sentence)",
  "defiActions": [
    {
      "protocol": "protocol name",
      "actionType": "swap/stake/lend/borrow/farm/withdraw/prepare",
      "fromAsset": "source asset (if applicable)",
      "toAsset": "target asset (if applicable)",
      "allocation": "e.g. 50%, 1000 USDC",
      "timing": "immediate/on-event/gradual/monitor",
      "triggerCondition": "e.g. rate_cut_confirmed, ETH > $2500 (if timing is on-event)",
      "priority": 1-10
    }
  ],
  "riskLevel": "low/medium/high",
  "targetReturn": "expected return (e.g. 5-10% APY, +20% upside, capital preservation)"
}

EXAMPLES:

Market: "Fed will cut rates in March" (85% YES)
Strategy: {
  "trade": true,
  "action": "YES",
  "confidence": 78,
  "reasoning": "Rate cuts historically boost risk assets and crypto prices",
  "strategyType": "RATE_CUT_PLAY",
  "strategyDescription": "Rate cuts reduce the appeal of USD-denominated yields, driving capital to risk assets. Accumulate stablecoins now at current yields, then rotate to ETH and staked ETH (stETH) when the cut is confirmed. This captures both the current stable yield and the anticipated ETH price appreciation.",
  "macroImplication": "Cheaper money favors risk-on assets like ETH and reduces stablecoin APYs",
  "defiActions": [
    {"protocol": "aave", "actionType": "lend", "fromAsset": "USDC", "toAsset": null, "allocation": "60%", "timing": "immediate", "priority": 1},
    {"protocol": "lido", "actionType": "prepare", "fromAsset": "USDC", "toAsset": "stETH", "allocation": "60%", "timing": "on-event", "triggerCondition": "rate_cut_confirmed", "priority": 2}
  ],
  "riskLevel": "medium",
  "targetReturn": "15-25% upside on ETH position"
}

Market: "Major DeFi hack in Q1" (25% YES)
Strategy: {
  "trade": true,
  "action": "NO",
  "confidence": 70,
  "reasoning": "Even 25% hack probability warrants defensive positioning",
  "strategyType": "RISK_OFF",
  "strategyDescription": "While probability is only 25%, the asymmetric downside risk justifies reducing exposure to high-risk DeFi protocols. Exit liquidity mining positions and move capital to battle-tested blue-chip protocols like Aave and Compound for safe yields.",
  "macroImplication": "Security concerns favor conservative, audited protocols over high-yield but risky farms",
  "defiActions": [
    {"protocol": "various", "actionType": "withdraw", "fromAsset": "LP tokens", "toAsset": "USDC", "allocation": "100%", "timing": "immediate", "priority": 1},
    {"protocol": "aave", "actionType": "lend", "fromAsset": "USDC", "toAsset": null, "allocation": "80%", "timing": "immediate", "priority": 2}
  ],
  "riskLevel": "low",
  "targetReturn": "4-6% APY with capital preservation"
}`

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const text = response.choices[0]?.message?.content || '{}'
    const signal: LLMSignal = JSON.parse(text)

    // Validate signal structure
    if (typeof signal.trade !== 'boolean') return null
    if (!['YES', 'NO'].includes(signal.action)) return null
    if (typeof signal.confidence !== 'number') return null

    // Validate new DeFi fields
    if (!signal.defiActions || !Array.isArray(signal.defiActions)) return null
    if (!signal.macroImplication) signal.macroImplication = signal.reasoning
    if (!signal.riskLevel) signal.riskLevel = 'medium'
    if (!signal.targetReturn) signal.targetReturn = 'TBD'

    // Ensure backward compatibility
    if (!signal.strategyType) signal.strategyType = 'RISK_OFF'
    if (!signal.strategyDescription) signal.strategyDescription = signal.reasoning

    return { market, signal, prob, volume, liquidity }
  } catch (err) {
    // Skip markets where LLM fails or returns bad JSON
    return null
  }
}

export async function analyzeMarkets(markets: Market[]): Promise<AnalyzedMarket[]> {
  const results: AnalyzedMarket[] = []

  console.log(`🤖 Analyzing ${markets.length} markets with Groq (llama-3.3-70b)...`)

  // Process in batches of 5 to respect rate limits
  const batchSize = 5
  for (let i = 0; i < markets.length; i += batchSize) {
    const batch = markets.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(analyzeMarket))
    results.push(...batchResults.filter((r): r is AnalyzedMarket => r !== null))

    // Small delay between batches
    if (i + batchSize < markets.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  return results
}

export function pickTopSignals(analyzed: AnalyzedMarket[], topN = 3): AnalyzedMarket[] {
  return analyzed
    .filter(a => a.signal.trade === true && a.signal.confidence >= 65)
    .sort((a, b) => b.signal.confidence - a.signal.confidence)
    .slice(0, topN)
}
