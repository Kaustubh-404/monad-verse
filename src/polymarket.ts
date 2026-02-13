import axios from 'axios'
import { Market } from './types'

const BASE_URL = process.env.POLYMARKET_API_URL || 'https://gamma-api.polymarket.com'

export async function fetchMarkets(limit = 100): Promise<Market[]> {
  try {
    const response = await axios.get(`${BASE_URL}/markets`, {
      params: {
        limit,
        active: true,
        closed: false,
        order: 'volume24hr',
        ascending: false
      },
      timeout: 15000
    })
    return response.data || []
  } catch (err) {
    console.error('Failed to fetch Polymarket data:', err)
    return []
  }
}

export function filterMarkets(markets: Market[]): Market[] {
  return markets.filter(m => {
    const volume = m.volume24hr || 0
    const liquidity = parseFloat(m.liquidity || '0')
    const prob = getProbability(m)

    return (
      volume > 1000 &&        // at least $1k daily volume
      liquidity > 5000 &&     // at least $5k liquidity
      prob >= 5 &&            // skip near-certain NO (< 5%)
      prob <= 95 &&           // skip near-certain YES (> 95%)
      m.active &&
      !m.closed &&
      m.acceptingOrders !== false
    )
  })
}

export function getProbability(market: Market): number {
  try {
    const prices: string[] = JSON.parse(market.outcomePrices || '[0.5, 0.5]')
    // First outcome is typically YES
    return parseFloat(prices[0]) * 100
  } catch {
    return 50
  }
}
