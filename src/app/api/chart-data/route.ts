/**
 * GET /api/chart-data?symbol=GGAL&days=90
 *
 * Proxy interno de datos históricos OHLCV desde FMP.
 * El LightweightChart component lo llama desde el cliente.
 * Cache de 5 minutos en Next.js (revalidate).
 */

import { NextRequest, NextResponse } from 'next/server'

const FMP_BASE = 'https://financialmodelingprep.com/api'
const FMP_KEY  = process.env.FMP_API_KEY ?? ''

export const runtime = 'edge'

interface FMPBar {
  date:   string
  open:   number
  high:   number
  low:    number
  close:  number
  volume: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')?.trim().toUpperCase()
  const days   = parseInt(searchParams.get('days') ?? '90', 10)

  if (!symbol) {
    return NextResponse.json({ error: 'symbol requerido' }, { status: 400 })
  }

  if (!FMP_KEY) {
    return NextResponse.json({ error: 'FMP_API_KEY no configurada' }, { status: 500 })
  }

  // Calcular fecha desde
  const from = new Date()
  from.setDate(from.getDate() - Math.max(days, 30))
  const fromStr = from.toISOString().split('T')[0]

  try {
    const url = `${FMP_BASE}/v3/historical-price-full/${symbol}?from=${fromStr}&apikey=${FMP_KEY}`

    const res = await fetch(url, {
      // Cache en edge por 5 minutos
    })

    if (!res.ok) {
      return NextResponse.json({ error: `FMP error ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const historical: FMPBar[] = data?.historical ?? []

    if (!historical.length) {
      return NextResponse.json([], { status: 200 })
    }

    // FMP devuelve desc → ordenar asc para Lightweight Charts
    const sorted = historical
      .slice()
      .reverse()
      .map(b => ({
        date:   b.date,
        open:   b.open,
        high:   b.high,
        low:    b.low,
        close:  b.close,
        volume: b.volume,
      }))

    return NextResponse.json(sorted, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (e) {
    console.error('[chart-data]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
