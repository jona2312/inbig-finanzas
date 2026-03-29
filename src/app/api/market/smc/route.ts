/**
 * GET /api/market/smc
 *
 * SMC Scanner — detecta Fair Value Gaps y Order Blocks en tiempo real.
 * Requiere plan in_pro o in_pro_plus.
 * Fuente de datos: Yahoo Finance (free, server-side, no API key).
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface FairValueGap {
  type: 'bullish' | 'bearish'
  top: number
  bottom: number
  sizePercent: number
  timestamp: number
  active: boolean
}

export interface OrderBlock {
  type: 'bullish' | 'bearish'
  top: number
  bottom: number
  timestamp: number
  active: boolean
  strengthPercent: number
}

export interface SMCSignal {
  symbol: string
  label: string
  price: number
  change24h: number
  fvgs: FairValueGap[]
  orderBlocks: OrderBlock[]
  timeframe: string
}

// ─── Assets ───────────────────────────────────────────────────────────────────

const ASSETS = [
  { symbol: 'BTC-USD',  label: 'Bitcoin'  },
  { symbol: 'ETH-USD',  label: 'Ethereum' },
  { symbol: '^GSPC',    label: 'S&P 500'  },
  { symbol: 'GC=F',     label: 'Oro'      },
  { symbol: 'EURUSD=X', label: 'EUR/USD'  },
  { symbol: 'YPF',      label: 'YPF'      },
]

// ─── Yahoo Finance OHLC ───────────────────────────────────────────────────────

async function fetchCandles(symbol: string): Promise<Candle[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`Yahoo error: ${symbol}`)
  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`No chart data: ${symbol}`)

  const timestamps: number[] = result.timestamp
  const q = result.indicators.quote[0]
  return timestamps
    .map((t, i) => ({
      time:  t,
      open:  q.open[i],
      high:  q.high[i],
      low:   q.low[i],
      close: q.close[i],
    }))
    .filter(c => c.open != null && c.high != null && c.low != null && c.close != null)
}

// ─── FVG Detection ────────────────────────────────────────────────────────────

function detectFVGs(candles: Candle[]): FairValueGap[] {
  const fvgs: FairValueGap[] = []
  const lastPrice = candles[candles.length - 1]?.close ?? 0

  for (let i = 2; i < candles.length; i++) {
    const prev2 = candles[i - 2]
    const curr  = candles[i]

    if (prev2.high < curr.low) {
      const bottom = prev2.high
      const top    = curr.low
      const sizePercent = ((top - bottom) / bottom) * 100
      if (sizePercent >= 0.05) {
        const active = lastPrice > bottom
        fvgs.push({ type: 'bullish', top, bottom, sizePercent, timestamp: curr.time, active })
      }
    }

    if (prev2.low > curr.high) {
      const top    = prev2.low
      const bottom = curr.high
      const sizePercent = ((top - bottom) / bottom) * 100
      if (sizePercent >= 0.05) {
        const active = lastPrice < top
        fvgs.push({ type: 'bearish', top, bottom, sizePercent, timestamp: curr.time, active })
      }
    }
  }

  return fvgs
    .sort((a, b) => Number(b.active) - Number(a.active) || b.timestamp - a.timestamp)
    .slice(0, 4)
}

// ─── Order Block Detection ────────────────────────────────────────────────────

function detectOrderBlocks(candles: Candle[]): OrderBlock[] {
  const obs: OrderBlock[] = []
  const lastPrice = candles[candles.length - 1]?.close ?? 0

  for (let i = 1; i < candles.length - 3; i++) {
    const c = candles[i]
    const isBearishCandle = c.close < c.open
    const isBullishCandle = c.close > c.open

    const next3 = candles.slice(i + 1, i + 4)
    if (next3.length < 2) continue
    const impulseOpen  = next3[0].open
    const impulseClose = next3[next3.length - 1].close
    const impulse = ((impulseClose - impulseOpen) / impulseOpen) * 100

    if (isBearishCandle && impulse > 1.0) {
      const top    = Math.max(c.open, c.close)
      const bottom = Math.min(c.open, c.close)
      const active = lastPrice > bottom
      obs.push({ type: 'bullish', top, bottom, timestamp: c.time, active, strengthPercent: impulse })
    }

    if (isBullishCandle && impulse < -1.0) {
      const top    = Math.max(c.open, c.close)
      const bottom = Math.min(c.open, c.close)
      const active = lastPrice < top
      obs.push({ type: 'bearish', top, bottom, timestamp: c.time, active, strengthPercent: Math.abs(impulse) })
    }
  }

  return obs
    .sort((a, b) => Number(b.active) - Number(a.active) || b.timestamp - a.timestamp)
    .slice(0, 3)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado', upgrade: false }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  if (!profile || !['in_pro', 'in_pro_plus'].includes(profile.tier)) {
    return NextResponse.json(
      { error: 'Requiere plan Pro o Pro+', upgrade: true },
      { status: 403 }
    )
  }

  const settled = await Promise.allSettled(
    ASSETS.map(async (asset): Promise<SMCSignal> => {
      const candles = await fetchCandles(asset.symbol)
      const last = candles[candles.length - 1]
      const prev = candles[candles.length - 2]
      const change24h = last && prev ? ((last.close - prev.close) / prev.close) * 100 : 0
      return {
        symbol:      asset.symbol,
        label:       asset.label,
        price:       last?.close ?? 0,
        change24h,
        fvgs:        detectFVGs(candles),
        orderBlocks: detectOrderBlocks(candles),
        timeframe:   '1D',
      }
    })
  )

  const signals = settled
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<SMCSignal>).value)

  return NextResponse.json({ signals, scannedAt: new Date().toISOString() })
}
