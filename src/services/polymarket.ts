/**
 * Polymarket Gamma API — Mercados de predicción
 * API pública, sin autenticación para lectura
 * https://gamma-api.polymarket.com
 */

export interface PolymarketEvent {
  id:          string
  title:       string
  slug:        string
  volume:      string
  liquidity:   string
  endDate:     string
  outcomes:    PolymarketOutcome[]
  image?:      string
  category?:   string
}

export interface PolymarketOutcome {
  title:  string
  price:  number  // 0-1 → probabilidad
}

// Keywords para filtrar mercados relevantes para LATAM / finanzas globales
const LATAM_KEYWORDS = [
  'argentina', 'mexico', 'brazil', 'latam', 'peso', 'bitcoin', 'btc',
  'fed', 'federal reserve', 'rate cut', 'interest rate', 'inflation',
  'oil', 'gold', 'nasdaq', 's&p', 'recession', 'imf', 'crypto',
  'ethereum', 'dollar', 'usd',
]

export async function getPolymarketEvents(limit = 6): Promise<PolymarketEvent[]> {
  try {
    // Buscar mercados activos ordenados por volumen
    const res = await fetch(
      'https://gamma-api.polymarket.com/events?closed=false&limit=50&order=volume&ascending=false',
      { next: { revalidate: 300 } } // cache 5 min
    )
    if (!res.ok) throw new Error('Polymarket API error')

    const data: PolymarketAPIEvent[] = await res.json()

    // Filtrar por relevancia LATAM/finanzas
    const relevant = data.filter((e) => {
      const text = (e.title + ' ' + (e.category ?? '')).toLowerCase()
      return LATAM_KEYWORDS.some((kw) => text.includes(kw))
    })

    // Si no hay suficientes relevantes, completar con los de mayor volumen
    const pool = relevant.length >= limit
      ? relevant
      : [...relevant, ...data.filter((e) => !relevant.includes(e))]

    return pool.slice(0, limit).map(mapEvent)
  } catch {
    // Fallback con datos de ejemplo para no romper el UI
    return FALLBACK_EVENTS
  }
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

interface PolymarketAPIEvent {
  id:         string
  title:      string
  slug:       string
  volume:     string
  liquidity:  string
  endDate:    string
  markets?:   Array<{ outcomePrices?: string; outcomes?: string }>
  image?:     string
  category?:  string
}

function mapEvent(e: PolymarketAPIEvent): PolymarketEvent {
  let outcomes: PolymarketOutcome[] = []

  if (e.markets?.[0]?.outcomes && e.markets?.[0]?.outcomePrices) {
    try {
      const titles = JSON.parse(e.markets[0].outcomes) as string[]
      const prices = JSON.parse(e.markets[0].outcomePrices) as string[]
      outcomes = titles.map((title, i) => ({
        title,
        price: parseFloat(prices[i] ?? '0'),
      }))
    } catch {
      outcomes = [{ title: 'Sí', price: 0.5 }, { title: 'No', price: 0.5 }]
    }
  }

  return {
    id:        e.id,
    title:     e.title,
    slug:      e.slug,
    volume:    e.volume,
    liquidity: e.liquidity,
    endDate:   e.endDate,
    outcomes,
    image:     e.image,
    category:  e.category,
  }
}

// ─── Fallback si la API no responde ──────────────────────────────────────────

const FALLBACK_EVENTS: PolymarketEvent[] = [
  {
    id: '1', title: '¿Habrá recorte de tasas de la Fed en 2026?', slug: 'fed-rate-cut-2026',
    volume: '45000000', liquidity: '12000000', endDate: '2026-12-31',
    outcomes: [{ title: 'Sí', price: 0.72 }, { title: 'No', price: 0.28 }],
  },
  {
    id: '2', title: '¿Bitcoin supera $100K antes de julio 2026?', slug: 'btc-100k-2026',
    volume: '28000000', liquidity: '8000000', endDate: '2026-07-01',
    outcomes: [{ title: 'Sí', price: 0.41 }, { title: 'No', price: 0.59 }],
  },
  {
    id: '3', title: '¿Habrá recesión en EE.UU. en 2026?', slug: 'us-recession-2026',
    volume: '18000000', liquidity: '5000000', endDate: '2026-12-31',
    outcomes: [{ title: 'Sí', price: 0.38 }, { title: 'No', price: 0.62 }],
  },
]

export function formatVolume(vol: string): string {
  const n = parseFloat(vol)
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}
