// ─────────────────────────────────────────────────────────────────────────────
// Market Data Service — Dólar (DolarAPI) + Crypto (CoinGecko) + US Markets (Yahoo)
// ─────────────────────────────────────────────────────────────────────────────

export interface DollarRate {
  nombre: string
  compra: number | null
  venta: number | null
  variacion?: number | null
}

export interface CryptoRate {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
}

export interface MarketOverview {
  dollar: DollarRate[]
  crypto: CryptoRate[]
  updatedAt: string
}

// ─── Dólar ────────────────────────────────────────────────────────────────────
export async function getDollarRates(): Promise<DollarRate[]> {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares', {
      next: { revalidate: 300 }, // cache 5 min
    })
    if (!res.ok) throw new Error('DolarAPI error')
    const data = await res.json()
    return data.map((d: { nombre: string; compra: number | null; venta: number | null }) => ({
      nombre: d.nombre,
      compra: d.compra,
      venta: d.venta,
    }))
  } catch {
    // Fallback con datos mock si la API falla
    return [
      { nombre: 'Oficial', compra: 1045, venta: 1065 },
      { nombre: 'Blue', compra: 1080, venta: 1100 },
      { nombre: 'MEP', compra: 1070, venta: 1075 },
      { nombre: 'CCL', compra: 1085, venta: 1090 },
      { nombre: 'Cripto', compra: 1090, venta: 1095 },
    ]
  }
}

// ─── Crypto ───────────────────────────────────────────────────────────────────
export async function getTopCrypto(limit = 10): Promise<CryptoRate[]> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      { next: { revalidate: 120 } } // cache 2 min
    )
    if (!res.ok) throw new Error('CoinGecko error')
    const data = await res.json()
    return data.map((c: {
      id: string; symbol: string; name: string;
      current_price: number; price_change_percentage_24h: number;
      market_cap: number; total_volume: number
    }) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      marketCap: c.market_cap,
      volume24h: c.total_volume,
    }))
  } catch {
    return [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 64200, change24h: 2.4, marketCap: 1260000000000, volume24h: 28000000000 },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3100, change24h: 1.8, marketCap: 373000000000, volume24h: 14000000000 },
      { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.0, change24h: 0.01, marketCap: 106000000000, volume24h: 52000000000 },
    ]
  }
}

// ─── US Markets (Yahoo Finance — free, server-side) ───────────────────────────

export interface USMarketQuote {
  symbol: string       // ^GSPC, GC=F, AAPL…
  label: string        // S&P 500, Oro, Apple…
  price: number
  change: number       // absolute
  changePercent: number
  currency: string
}

const US_SYMBOLS: Record<string, string> = {
  '^GSPC':    'S&P 500',
  '^NDX':     'Nasdaq 100',
  'GC=F':     'Oro',
  'CL=F':     'Petróleo',
  'EURUSD=X': 'EUR/USD',
  'AAPL':     'Apple',
  'TSLA':     'Tesla',
  'GOOGL':    'Google',
  'NVDA':     'NVIDIA',
}

export async function getUSMarkets(
  symbols: string[] = ['^GSPC', '^NDX', 'GC=F', 'CL=F', 'EURUSD=X']
): Promise<USMarketQuote[]> {
  try {
    const joined = symbols.join(',')
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,currency`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 120 }, // cache 2 min
      }
    )
    if (!res.ok) throw new Error('Yahoo Finance error')
    const json = await res.json()
    const results = json?.quoteResponse?.result ?? []

    return results.map((q: {
      symbol: string
      regularMarketPrice: number
      regularMarketChange: number
      regularMarketChangePercent: number
      currency?: string
    }) => ({
      symbol: q.symbol,
      label: US_SYMBOLS[q.symbol] ?? q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      currency: q.currency ?? 'USD',
    }))
  } catch {
    // Fallback con datos ilustrativos
    return [
      { symbol: '^GSPC',    label: 'S&P 500',    price: 5210,   change: 18.5,  changePercent: 0.36,  currency: 'USD' },
      { symbol: '^NDX',     label: 'Nasdaq 100',  price: 18140,  change: 92.0,  changePercent: 0.51,  currency: 'USD' },
      { symbol: 'GC=F',     label: 'Oro',         price: 2340,   change: 12.0,  changePercent: 0.52,  currency: 'USD' },
      { symbol: 'CL=F',     label: 'Petróleo',    price: 79.5,   change: -0.8,  changePercent: -1.02, currency: 'USD' },
      { symbol: 'EURUSD=X', label: 'EUR/USD',     price: 1.0820, change: 0.002, changePercent: 0.19,  currency: 'USD' },
    ]
  }
}

// ─── Overview combinado ───────────────────────────────────────────────────────
export async function getMarketOverview(): Promise<MarketOverview> {
  const [dollar, crypto] = await Promise.all([getDollarRates(), getTopCrypto(5)])
  return { dollar, crypto, updatedAt: new Date().toISOString() }
}
