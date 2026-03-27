/**
 * Financial Modeling Prep (FMP) Service
 * Misma fuente de datos que Perplexity Finance — con cobertura LATAM
 * https://financialmodelingprep.com/developer/docs
 */

const FMP_BASE = 'https://financialmodelingprep.com/api'
const FMP_KEY  = process.env.FMP_API_KEY ?? ''

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface FMPQuote {
  symbol:            string
  name:              string
  price:             number
  changesPercentage: number
  change:            number
  dayLow:            number
  dayHigh:           number
  yearLow:           number
  yearHigh:          number
  volume:            number
  avgVolume:         number
  open:              number
  previousClose:     number
  marketCap:         number
  exchange:          string
  timestamp:         number
}

export interface FMPScreenerResult {
  symbol:            string
  companyName:       string
  marketCap:         number
  sector:            string
  industry:          string
  beta:              number
  price:             number
  lastAnnualDividend:number
  volume:            number
  exchange:          string
  exchangeShortName: string
  country:           string
  isEtf:             boolean
  isActivelyTrading: boolean
}

export interface FMPHistoricalPrice {
  date:   string
  open:   number
  high:   number
  low:    number
  close:  number
  volume: number
}

export interface FMPEconomicEvent {
  event:     string
  date:      string
  country:   string
  actual:    number | null
  previous:  number | null
  estimate:  number | null
  impact:    'Low' | 'Medium' | 'High'
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function fmpFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${FMP_BASE}${endpoint}`)
  url.searchParams.set('apikey', FMP_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 }, // cache 60s — suficiente para datos de mercado
  })

  if (!res.ok) throw new Error(`FMP error ${res.status} en ${endpoint}`)
  return res.json()
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

/**
 * Precio en tiempo real para uno o más símbolos
 * Ej: getQuotes(['GGAL.BA', 'YPF.BA', 'AMZN', 'BTC/USD'])
 */
export async function getQuotes(symbols: string[]): Promise<FMPQuote[]> {
  return fmpFetch<FMPQuote[]>(`/v3/quote/${symbols.join(',')}`)
}

/**
 * Quote individual
 */
export async function getQuote(symbol: string): Promise<FMPQuote | null> {
  const data = await getQuotes([symbol])
  return data[0] ?? null
}

// ─── Activos LATAM predefinidos ───────────────────────────────────────────────

/** Acciones BYMA (Bolsa de Buenos Aires) más seguidas */
export const BYMA_SYMBOLS = [
  'GGAL.BA',  // Grupo Financiero Galicia
  'YPF.BA',   // YPF
  'BMA.BA',   // Banco Macro
  'TXAR.BA',  // Ternium Argentina
  'ALUA.BA',  // Aluar
  'SUPV.BA',  // Grupo Supervielle
  'PAMP.BA',  // Pampa Energía
  'TECO2.BA', // Telecom Argentina
  'COME.BA',  // Sociedad Comercial del Plata
  'BBAR.BA',  // BBVA Argentina
]

/** CEDEARs más operados */
export const CEDEAR_SYMBOLS = [
  'AAPL.BA',  // Apple CEDEAR
  'GOOGL.BA', // Alphabet CEDEAR
  'AMZN.BA',  // Amazon CEDEAR
  'MSFT.BA',  // Microsoft CEDEAR
  'TSLA.BA',  // Tesla CEDEAR
  'NVDA.BA',  // Nvidia CEDEAR
]

/** Índices globales relevantes para LATAM */
export const INDICES_SYMBOLS = [
  '^MERV',    // Merval
  '^BVSP',    // Bovespa (Brasil)
  '^MXX',     // IPC México
  '^SPX',     // S&P 500
  '^NDX',     // Nasdaq 100
  'GC=F',     // Oro (futures)
  'CL=F',     // Petróleo WTI
]

export async function getBymaTop(): Promise<FMPQuote[]> {
  return getQuotes(BYMA_SYMBOLS)
}

export async function getCedearsTop(): Promise<FMPQuote[]> {
  return getQuotes(CEDEAR_SYMBOLS)
}

export async function getIndices(): Promise<FMPQuote[]> {
  return getQuotes(INDICES_SYMBOLS)
}

// ─── Histórico ────────────────────────────────────────────────────────────────

/**
 * Precios históricos OHLCV (para charts TradingView o Recharts)
 * @param symbol  Ej: 'GGAL.BA'
 * @param from    Ej: '2024-01-01'
 * @param to      Ej: '2025-12-31'
 */
export async function getHistoricalPrices(
  symbol: string,
  from?: string,
  to?: string
): Promise<FMPHistoricalPrice[]> {
  const params: Record<string, string> = {}
  if (from) params.from = from
  if (to)   params.to   = to

  const data = await fmpFetch<{ historical: FMPHistoricalPrice[] }>(
    `/v3/historical-price-full/${symbol}`,
    params
  )
  return data.historical ?? []
}

// ─── Screener (el diferencial de INBIG vs Perplexity) ────────────────────────

export interface ScreenerParams {
  exchange?:         string   // BCBA | NYSE | NASDAQ | BMV
  country?:          string   // AR | MX | BR | US
  sector?:           string
  marketCapMoreThan?: number
  marketCapLessThan?: number
  priceMoreThan?:    number
  priceLessThan?:    number
  betaMoreThan?:     number
  betaLessThan?:     number
  volumeMoreThan?:   number
  limit?:            number
}

/**
 * Screener programático — la misma funcionalidad que Perplexity Finance
 * pero con activos LATAM y queries en español vía LLM
 * Ej: getScreener({ exchange: 'BCBA', marketCapMoreThan: 1_000_000_000 })
 */
export async function getScreener(params: ScreenerParams): Promise<FMPScreenerResult[]> {
  const queryParams: Record<string, string> = {
    limit: String(params.limit ?? 20),
  }
  if (params.exchange)          queryParams.exchange          = params.exchange
  if (params.country)           queryParams.country           = params.country
  if (params.sector)            queryParams.sector            = params.sector
  if (params.marketCapMoreThan) queryParams.marketCapMoreThan = String(params.marketCapMoreThan)
  if (params.marketCapLessThan) queryParams.marketCapLessThan = String(params.marketCapLessThan)
  if (params.priceMoreThan)     queryParams.priceMoreThan     = String(params.priceMoreThan)
  if (params.priceLessThan)     queryParams.priceLessThan     = String(params.priceLessThan)
  if (params.volumeMoreThan)    queryParams.volumeMoreThan    = String(params.volumeMoreThan)

  return fmpFetch<FMPScreenerResult[]>('/v3/stock-screener', queryParams)
}

// ─── Calendario económico LATAM ───────────────────────────────────────────────

/**
 * Eventos económicos próximos (CPI, NFP, decisiones de tasa, etc.)
 * Filtra por países LATAM + USA por defecto
 */
export async function getEconomicCalendar(
  from: string,
  to: string,
  countries: string[] = ['AR', 'MX', 'BR', 'US', 'EU']
): Promise<FMPEconomicEvent[]> {
  const data = await fmpFetch<FMPEconomicEvent[]>('/v3/economic_calendar', { from, to })
  return data.filter(e => countries.includes(e.country))
}

// ─── Fundamentales rápidos ────────────────────────────────────────────────────

export interface FMPProfile {
  symbol:        string
  companyName:   string
  currency:      string
  exchange:      string
  exchangeShortName: string
  industry:      string
  sector:        string
  country:       string
  description:   string
  ceo:           string
  website:       string
  image:         string
  ipoDate:       string
  mktCap:        number
  volAvg:        number
  lastDiv:       number
  range:         string
  beta:          number
  price:         number
}

export async function getCompanyProfile(symbol: string): Promise<FMPProfile | null> {
  const data = await fmpFetch<FMPProfile[]>(`/v3/profile/${symbol}`)
  return data[0] ?? null
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

export function formatChangePercent(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9)  return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6)  return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}

export function isPositive(change: number): boolean {
  return change >= 0
}
