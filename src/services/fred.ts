/**
 * FRED Service — Federal Reserve Economic Data
 *
 * API pública, gratuita, sin límite de calls.
 * Fuente: St. Louis Federal Reserve
 * Docs: https://fred.stlouisfed.org/docs/api/fred/
 *
 * Series clave para LATAM:
 * - FEDFUNDS  — Fed Funds Rate (tasa Fed)
 * - CPIAUCSL  — CPI USA (inflación)
 * - UNRATE    — Desempleo USA
 * - DGS10     — Bono 10 años USA (Treasury yield)
 * - DXY/DTWEXBGS — Índice dólar
 * - DCOILWTICO — Precio petróleo WTI
 */

const FRED_BASE = 'https://api.stlouisfed.org/fred'
const FRED_KEY  = process.env.FRED_API_KEY ?? 'abcdefghijklmnopqrstuvwxyz123456' // key pública fallback

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface FREDObservation {
  date:  string
  value: number | null
}

export interface FREDSeries {
  id:            string
  label:         string
  value:         number | null
  previous:      number | null
  change:        number | null
  changePct:     number | null
  date:          string
  unit:          string
  frequency:     string
}

export interface MacroSnapshot {
  fedFunds:      FREDSeries
  cpi:           FREDSeries
  unemployment:  FREDSeries
  treasury10y:   FREDSeries
  wtiOil:        FREDSeries
  updatedAt:     string
}

// ─── Series IDs ────────────────────────────────────────────────────────────────

const SERIES = {
  fedFunds:     { id: 'FEDFUNDS',   label: 'Fed Funds Rate',    unit: '%',  frequency: 'Mensual' },
  cpi:          { id: 'CPIAUCSL',   label: 'CPI USA (YoY)',     unit: '%',  frequency: 'Mensual' },
  unemployment: { id: 'UNRATE',     label: 'Desempleo USA',     unit: '%',  frequency: 'Mensual' },
  treasury10y:  { id: 'DGS10',      label: 'Treasury 10Y',      unit: '%',  frequency: 'Diaria'  },
  wtiOil:       { id: 'DCOILWTICO', label: 'Petróleo WTI',      unit: 'USD', frequency: 'Diaria' },
} as const

// ─── Helper ───────────────────────────────────────────────────────────────────

async function fetchSeries(
  seriesId: string,
  limit = 5,
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<FREDObservation[]> {
  const url = new URL(`${FRED_BASE}/series/observations`)
  url.searchParams.set('series_id', seriesId)
  url.searchParams.set('api_key', FRED_KEY)
  url.searchParams.set('file_type', 'json')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('sort_order', sortOrder)

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // cache 1 hora — macro no cambia tan seguido
  })

  if (!res.ok) throw new Error(`FRED error ${res.status} en ${seriesId}`)

  const data = await res.json()

  return (data.observations ?? [])
    .filter((o: { value: string }) => o.value !== '.')
    .map((o: { date: string; value: string }) => ({
      date:  o.date,
      value: parseFloat(o.value),
    }))
}

function buildSeries(
  meta: typeof SERIES[keyof typeof SERIES],
  obs: FREDObservation[]
): FREDSeries {
  const latest   = obs[0]
  const previous = obs[1]

  const value    = latest?.value ?? null
  const prev     = previous?.value ?? null

  let change    = null
  let changePct = null

  if (value != null && prev != null) {
    change    = parseFloat((value - prev).toFixed(4))
    changePct = parseFloat(((change / Math.abs(prev)) * 100).toFixed(2))
  }

  return {
    id:        meta.id,
    label:     meta.label,
    value,
    previous:  prev,
    change,
    changePct,
    date:      latest?.date ?? '',
    unit:      meta.unit,
    frequency: meta.frequency,
  }
}

// ─── Función principal ─────────────────────────────────────────────────────────

export async function getMacroSnapshot(): Promise<MacroSnapshot> {
  // Parallel fetch de todas las series
  const [fedObs, cpiObs, unrateObs, t10yObs, wtiObs] = await Promise.allSettled([
    fetchSeries(SERIES.fedFunds.id,     3),
    fetchSeries(SERIES.cpi.id,          3),
    fetchSeries(SERIES.unemployment.id, 3),
    fetchSeries(SERIES.treasury10y.id,  3),
    fetchSeries(SERIES.wtiOil.id,       3),
  ])

  const get = (r: PromiseSettledResult<FREDObservation[]>) =>
    r.status === 'fulfilled' ? r.value : []

  return {
    fedFunds:     buildSeries(SERIES.fedFunds,     get(fedObs)),
    cpi:          buildSeries(SERIES.cpi,          get(cpiObs)),
    unemployment: buildSeries(SERIES.unemployment, get(unrateObs)),
    treasury10y:  buildSeries(SERIES.treasury10y,  get(t10yObs)),
    wtiOil:       buildSeries(SERIES.wtiOil,       get(wtiObs)),
    updatedAt:    new Date().toISOString(),
  }
}

// ─── Serie histórica para gráfico ─────────────────────────────────────────────

export async function getSeriesHistory(
  seriesId: string,
  limit = 24
): Promise<FREDObservation[]> {
  const obs = await fetchSeries(seriesId, limit, 'desc')
  return obs.reverse() // cronológico para gráficos
}
