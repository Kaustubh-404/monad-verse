export interface Market {
  conditionId: string
  question: string
  slug: string
  liquidity: string        // string in API
  volume24hr: number       // number in API
  liquidityNum: number
  outcomes: string         // JSON string e.g. "[\"Yes\", \"No\"]"
  outcomePrices: string    // JSON string e.g. "[\"0.72\", \"0.28\"]"
  active: boolean
  closed: boolean
  acceptingOrders: boolean
}

export interface LLMSignal {
  trade: boolean
  action: 'YES' | 'NO'
  confidence: number   // 0-100
  reasoning: string
  strategyType: string       // e.g. RISK_OFF, LONG_ETH, STABLE_YIELD, HEDGE
  strategyDescription: string  // 2-3 sentence strategy explanation
}

export interface Position {
  marketId: string
  marketQuestion: string
  action: string
  entryProbability: number
  confidence: number
  reasoning: string
  paperAmountUSD: number
  txHash?: string
  openedAt: number
}

export interface AnalyzedMarket {
  market: Market
  signal: LLMSignal
  prob: number      // YES probability 0-100
  volume: number
  liquidity: number
}
