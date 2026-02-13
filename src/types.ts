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
