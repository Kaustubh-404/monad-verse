import Groq from 'groq-sdk'
import { Market, LLMSignal, AnalyzedMarket } from './types'
import { getProbability } from './polymarket'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function analyzeMarket(market: Market): Promise<AnalyzedMarket | null> {
  const prob = getProbability(market)
  const volume = market.volume24hr || 0
  const liquidity = parseFloat(market.liquidity || '0')

  const prompt = `You are an expert prediction market analyst giving clear, actionable trade instructions to users.

Market: "${market.question}"
Current YES probability: ${prob.toFixed(1)}%
24h Volume: $${volume.toLocaleString()}
Liquidity: $${liquidity.toLocaleString()}

Rules for analysis:
- Only recommend if you are genuinely confident
- Avoid markets between 40-60% probability (too uncertain)
- NEVER recommend markets below 5% or above 95% — near-expired, not opportunities
- Look for mispricing, momentum shifts, crowd overreactions in the 10-40% or 60-90% range
- If unsure, set trade to false
- strategyType must be one of: RISK_OFF, RISK_ON, LONG_ETH, STABLE_YIELD, HEDGE, MOMENTUM, CONTRARIAN

For strategyDescription, write exactly what the user should DO — be specific and direct:
- Start with: "Go to Polymarket and bet [YES/NO] on this market."
- Explain WHY the current crowd probability is wrong or mispriced in plain English
- State the edge: what makes this a good bet right now
- End with the DeFi portfolio implication (e.g. "This suggests rotating to risk-off assets / holding more stablecoins / increasing ETH exposure")
- Keep it 3-4 sentences, no jargon, as if explaining to a smart friend

Respond ONLY with valid JSON, no other text:
{"trade": true or false, "action": "YES" or "NO", "confidence": 0-100, "reasoning": "one sentence summary", "strategyType": "TYPE", "strategyDescription": "3-4 sentence actionable instruction"}`

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const text = response.choices[0]?.message?.content || '{}'
    const signal: LLMSignal = JSON.parse(text)

    // Validate signal shape
    if (typeof signal.trade !== 'boolean') return null
    if (!['YES', 'NO'].includes(signal.action)) return null
    if (typeof signal.confidence !== 'number') return null

    // Fallback defaults for new fields
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
