/**
 * Commodities Service — FMP + precios clave para LATAM
 *
 * Soja, trigo, maíz → crítico para Argentina (40% de exportaciones)
 * Petróleo WTI/Brent → impacta todo LATAM
 * Oro, plata, cobre → reservas + industria
 *
 * FMP endpoint: /v3/quotes/commodity
 * Cache: 5 minutos (precios de commodity no cambian segundo a segundo)
 */

const FMP_BASE = 'https://financialmodelingprep.com/api'
const FMP_KEY  = process.env.FMP_API_KEY ?? ''

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CommodityQuote {
  symbol:            string
  name:              string
  price:             number
  change:            number
  changesPercentage: number
  dayLow:            number
  dayHigh:           number
  yearLow:           number
  yearHigh:          number
  volume:            number
  unit:              string
  emoji:             string
  category:          'energia' | 'granos' | 'metales'
}

// ─── Mapa de commodities que nos interesan ────────────────────────────────────

const COMMODITY_META: Record<string, { name: string; unit: string; emoji: string; category: CommodityQuote['category'] }> = {
  // Energía
  'CRUDETIMESTAMP':    { name: 'Petróleo WTI',  unit: 'USD/bbl', emoji: '🛢️',  category: 'energia' },
  'BRTUSD':           { name: 'Brent Crude',   unit: 'USD/bbl', emoji: '🛢️',  category: 'energia' },
  'NGUSD':            { name: 'Gas Natural',   unit: 'USD/MMBtu',emoji: '⚡', category: 'energia' },
  // Granos — críticos para Argentina
  'SOYUSD':           { name: 'Soja',          unit: 'USD/bu',  emoji: '🌱',  category: 'granos' },
  'WHEATUSD':         { name: 'Trigo',         unit: 'USD/bu',  emoji: '🌾',  category: 'granos' },
  'CORNUSD':          { name: 'Maíz',          unit: 'USD/bu',  emoji: '🌽',  category: 'granos' },
  // Metales
  'GCUSD':            { name: 'Oro',           unit: 'USD/oz',  emoji: '🥇',  category: 'metales' },
  'SIUSD':            { name: 'Plata',         unit: 'USD/oz',  emoji: '⬜',  category: 'metales' },
  'HGUSD':            { name: 'Cobre',         unit: 'USD/lb',  emoji: '🔶',  category: 'metales' },
}

// Símbolos alternativos que devuelve FMP
const SYMBOL_ALIASES: Record<string, string> = {
  'OUSX':  'CRUDETIMESTAMP',
  'ZSUSX': 'SOYUSD',
  'ZWUSX': 'WHEATUSD',
  'ZCUSX': 'CORNUSD',
  'GCUSX': 'GCUSD',
  'SIUSX': 'SIUSD',
  'HGUSX': 'HGUSD',
}

// ─── Fallback mock ────────────────────────────────────────────────────────────

const FALLBACK_COMMODITIES: CommodityQuote[] = [
  { symbol: 'CRUDETIMESTAMP', name: 'Petróleo WTI', price: 73.80,  change: 0.45,  changesPercentage:  0.61, dayLow: 73.10, dayHigh: 74.20, yearLow: 65.00, yearHigh: 95.00, volume: 0, unit: 'USD/bbl', emoji: '🛢️',  category: 'energia' },
  { symbol: 'BRTUSD',         name: 'Brent Crude',  price: 77.40,  change: 0.30,  changesPercentage:  0.39, dayLow: 76.80, dayHigh: 77.90, yearLow: 68.00, yearHigh: 97.00, volume: 0, unit: 'USD/bbl', emoji: '🛢️',  category: 'energia' },
  { symbol: 'SOYUSD',         name: 'Soja',         price: 972.50, change: -4.25, changesPercentage: -0.44, dayLow: 968.00,dayHigh: 979.00,yearLow: 870.00,yearHigh:1080.00,volume: 0, unit: 'USD/bu',  emoji: '🌱',  category: 'granos'  },
  { symbol: 'WHEATUSD',       name: 'Trigo',        price: 561.25, change:  2.75, changesPercentage:  0.49, dayLow: 558.50,dayHigh: 564.00,yearLow: 495.00,yearHigh: 680.00,volume: 0, unit: 'USD/bu',  emoji: '🌾',  category: 'granos'  },
  { symbol: 'CORNUSD',        name: 'Maíz',         price: 435.00, change: -1.50, changesPercentage: -0.34, dayLow: 433.00,dayHigh: 438.00,yearLow: 380.00,yearHigh: 520.00,volume: 0, unit: 'USD/bu',  emoji: '🌽',  category: 'granos'  },
  { symbol: 'GCUSD',          name: 'Oro',          price: 2380.50,change: 12.30, changesPercentage:  0.52, dayLow:2370.00,dayHigh:2390.00,yearLow:1980.00,yearHigh:2450.00,volume: 0, unit: 'USD/oz',  emoji: '🥇',  category: 'metales' },
  { symbol: 'SIUSD',          name: 'Plata',        price: 28.45,  change:  0.22, changesPercentage:  0.78, dayLow: 28.10, dayHigh: 28.70, yearLow: 22.00, yearHigh: 32.00, volume: 0, unit: 'USD/oz',  emoji: '⬜',  category: 'metales' },
  { symbol: 'HGUSD',          name: 'Cobre',        price: 4.35,   change: -0.03, changesPercentage: -0.68, dayLow:  4.30, dayHigh:  4.40, yearLow:  3.60, yearHigh:  5.00, volume: 0, unit: 'USD/lb',  emoji: '🔶',  category: 'metales' },
]

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getCommodityQuotes(): Promise<CommodityQuote[]> {
  if (!FMP_KEY) return FALLBACK_COMMODITIES

  try {
    const res = await fetch(
      `${FMP_BASE}/v3/quotes/commodity?apikey=${FMP_KEY}`,
      { next: { revalidate: 300 } }
    )

    if (!res.ok) throw new Error(`FMP ${res.status}`)

    const data: { symbol: string; name: string; price: number; change: number; changesPercentage: number; dayLow: number; dayHigh: number; yearLow: number; yearHigh: number; volume: number }[] = await res.json()

    const results: CommodityQuote[] = []

    for (const item of data) {
      const canonical = SYMBOL_ALIASES[item.symbol] ?? item.symbol
      const meta = COMMODITY_META[canonical] ?? COMMODITY_META[item.symbol]
      if (!meta) continue

      results.push({
        symbol:            canonical,
        name:              meta.name,
        price:             item.price,
        change:            item.change,
        changesPercentage: item.changesPercentage,
        dayLow:            item.dayLow,
        dayHigh:           item.dayHigh,
        yearLow:           item.yearLow,
        yearHigh:          item.yearHigh,
        volume:            item.volume,
        unit:              meta.unit,
        emoji:             meta.emoji,
        category:          meta.category,
      })
    }

    // Si FMP no devolvió suficiente, merge con fallback
    if (results.length < 4) return FALLBACK_COMMODITIES
    return results.sort((a, b) => {
      const order = ['energia', 'granos', 'metales']
      return order.indexOf(a.category) - order.indexOf(b.category)
    })

  } catch (e) {
    console.error('[commodities] FMP error, usando fallback:', e)
    return FALLBACK_COMMODITIES
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatCommodityPrice(price: number, unit: string): string {
  if (unit.includes('oz') || unit.includes('bbl')) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  // granos en centavos de bushel → mostrar en USD
  if (price > 100) {
    return `$${(price / 100).toFixed(2)}`
  }
  return `$${price.toFixed(2)}`
}
