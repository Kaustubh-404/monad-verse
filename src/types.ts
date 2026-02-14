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

export interface DeFiAction {
  protocol: string           // e.g. 'uniswap', 'aave', 'lido', 'compound'
  actionType: 'swap' | 'stake' | 'lend' | 'borrow' | 'farm' | 'withdraw' | 'prepare'
  fromAsset?: string        // source asset (e.g. 'USDC', 'ETH')
  toAsset?: string          // target asset (e.g. 'stETH', 'DAI')
  allocation: string        // percentage or amount (e.g. '50%', '1000 USDC')
  timing: 'immediate' | 'on-event' | 'gradual' | 'monitor'
  triggerCondition?: string // e.g. 'rate_cut_confirmed', 'price > $2000'
  priority: number          // execution order 1-10
}

export interface LLMSignal {
  trade: boolean            // whether to act on this signal
  action: 'YES' | 'NO'      // legacy: market direction (kept for backward compat)
  confidence: number        // 0-100
  reasoning: string         // one sentence summary
  strategyType: string      // e.g. RISK_OFF, RATE_CUT_PLAY, STABLE_YIELD, LEVERAGE
  strategyDescription: string  // detailed strategy explanation
  macroImplication: string  // what this prediction means for crypto markets
  defiActions: DeFiAction[] // concrete DeFi actions to execute
  riskLevel: 'low' | 'medium' | 'high'
  targetReturn: string      // expected return (e.g. '5-10% APY', '+20% upside')
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
