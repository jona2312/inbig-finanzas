/**
 * CoinGecko API Service — INBIG Finanzas
 * API pública (sin key) | rate limit: 30 req/min demo, 500 req/min Pro
 * Docs: https://docs.coingecko.com/reference/introduction
 */

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoinGeckoCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number | null
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
  sparkline_in_7d?: { price: number[] }
}

export interface CoinGeckoHistoricalPrice {
  prices: [number, number][]       // [timestamp, price]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export interface CoinGeckoTrendingCoin {
  item: {
    id: string
    name: string
    symbol: string
    thumb: string
    market_cap_rank: number
    score: number
    data: {
      price: string
      price_change_percentage_24h: { usd: number }
      total_volume: string
      market_cap: string
      sparkline: string
    }
  }
}

export interface GlobalMarketData {
  data: {
    active_cryptocurrencies: number
    total_market_cap: Record<string, number>
    total_volume: Record<string, number>
    market_cap_percentage: Record<string, number>
    market_cap_change_percentage_24h_usd: number
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Top coins relevantes para LATAM — BTC, ETH + stables + DeFi populares
export const FEATURED_COINS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
  'usd-coin', 'ripple', 'cardano', 'avalanche-2', 'chainlink'
]

// Helpers
export function formatPrice(price: number): string {
  if (price >= 1) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(price)
  }
  // Para precios < $1 (altcoins) mostrar más decimales
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6
  }).format(price)
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
  if (cap >= 1e9)  return `$${(cap / 1e9).toFixed(2)}B`
  if (cap >= 1e6)  return `$${(cap / 1e6).toFixed(2)}M`
  return `$${cap.toLocaleString('es-AR')}`
}

export function formatVolume(vol: number): string {
  return formatMarketCap(vol)
}

export function isPositive(val: number): boolean {
  return val >= 0
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Top N coins por market cap. Incluye sparkline 7d y cambios 7d/30d.
 */
export async function getTopCoins(limit = 20, page = 1): Promise<CoinGeckoCoin[]> {
  try {
    const url = new URL(`${COINGECKO_BASE}/coins/markets`)
    url.searchParams.set('vs_currency', 'usd')
    url.searchParams.set('order', 'market_cap_desc')
    url.searchParams.set('per_page', String(limit))
    url.searchParams.set('page', String(page))
    url.searchParams.set('sparkline', 'true')
    url.searchParams.set('price_change_percentage', '7d,30d')
    url.searchParams.set('locale', 'es')

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' }
    })

    if (!res.ok) throw new Error(`CoinGecko markets: ${res.status}`)
    return res.json()
  } catch (err) {
    console.error('[CoinGecko] getTopCoins error:', err)
    return []
  }
}

/**
 * Precios históricos de un coin — por defecto últimos 30 días
 */
export async function getCoinHistory(
  coinId: string,
  days: 1 | 7 | 30 | 90 | 365 = 30
): Promise<CoinGeckoHistoricalPrice | null> {
  try {
    const url = new URL(`${COINGECKO_BASE}/coins/${coinId}/market_chart`)
    url.searchParams.set('vs_currency', 'usd')
    url.searchParams.set('days', String(days))
    url.searchParams.set('interval', days <= 7 ? 'hourly' : 'daily')

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' }
    })

    if (!res.ok) throw new Error(`CoinGecko history ${coinId}: ${res.status}`)
    return res.json()
  } catch (err) {
    console.error(`[CoinGecko] getCoinHistory(${coinId}) error:`, err)
    return null
  }
}

/**
 * Trending coins en las últimas 24h (endpoint público, sin rate limit estricto)
 */
export async function getTrendingCoins(): Promise<CoinGeckoTrendingCoin[]> {
  try {
    const res = await fetch(`${COINGECKO_BASE}/search/trending`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`CoinGecko trending: ${res.status}`)
    const data = await res.json()
    return data.coins ?? []
  } catch (err) {
    console.error('[CoinGecko] getTrendingCoins error:', err)
    return []
  }
}

/**
 * Datos globales del mercado crypto: dominancia BTC, total cap, etc.
 */
export async function getGlobalMarketData(): Promise<GlobalMarketData['data'] | null> {
  try {
    const res = await fetch(`${COINGECKO_BASE}/global`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`CoinGecko global: ${res.status}`)
    const data: GlobalMarketData = await res.json()
    return data.data
  } catch (err) {
    console.error('[CoinGecko] getGlobalMarketData error:', err)
    return null
  }
}

/**
 * Mocked fallback coins para cuando la API rate-limita (sin key)
 */
export function getFallbackCoins(): Partial<CoinGeckoCoin>[] {
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 68500, price_change_percentage_24h: 1.2, market_cap: 1.35e12, market_cap_rank: 1, total_volume: 28e9 },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3600, price_change_percentage_24h: -0.8, market_cap: 432e9, market_cap_rank: 2, total_volume: 14e9 },
    { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.0, price_change_percentage_24h: 0.01, market_cap: 110e9, market_cap_rank: 3, total_volume: 50e9 },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 580, price_change_percentage_24h: 0.5, market_cap: 85e9, market_cap_rank: 4, total_volume: 2.1e9 },
    { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 175, price_change_percentage_24h: 3.2, market_cap: 80e9, market_cap_rank: 5, total_volume: 4.5e9 },
  ]
}
