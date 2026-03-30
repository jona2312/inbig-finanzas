'use client'
/**
 * TerminalClient — El corazón de la experiencia Pro de INBIG
 *
 * Layout Bloomberg:
 * [Watchlist | Chart TradingView | Panel derecho: Copilot + Comunidad]
 *
 * Tiers:
 * - lector: chart preview (solo lectura, sin watchlist propia, copilot 5/día)
 * - in_pro: chart full + watchlist + copilot ilimitado + comunidad
 * - in_pro_plus: todo + señales + datos institucionales
 */
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { CopilotBox } from '@/components/copilot/copilot-box'
import { AlertCircle, RefreshCw } from 'lucide-react'

const CommunityFeedRealtime = dynamic(
  () => import('./community-feed-realtime').then(m => ({ default: m.CommunityFeedRealtime })),
  { ssr: false, loading: () => <div className="h-48 bg-zinc-900 rounded-xl animate-pulse" /> }
)

const WorldMarketsMap = dynamic(
  () => import('@/components/market/world-markets-map').then(m => ({ default: m.WorldMarketsMap })),
  { ssr: false, loading: () => <div className="h-48 bg-zinc-900 rounded-xl animate-pulse" /> }
)

// ─── Types ───────────────────────────────────────────────────────────────────
interface TerminalClientProps {
  tier: 'lector' | 'in_pro' | 'in_pro_plus'
  userId: string | null
  tradingPlan: Record<string, unknown> | null
}

interface WatchItem {
  symbol: string
  label: string
  price?: number
  change?: number
  spark?: number[]   // last 12 data points for sparkline
}

// ─── Default watchlist ────────────────────────────────────────────────────────
const DEFAULT_WATCHLIST: WatchItem[] = [
  { symbol: 'GGAL',   label: 'Galicia',       spark: [3.8,3.9,4.0,3.95,4.1,4.05,4.2,4.15,4.3,4.25,4.4,4.35] },
  { symbol: 'MELI',   label: 'MercadoLibre',  spark: [1800,1820,1810,1850,1870,1860,1900,1880,1920,1910,1950,1940] },
  { symbol: 'YPF',    label: 'YPF',           spark: [14,14.2,14.1,14.5,14.3,14.6,14.8,14.7,15.0,14.9,15.2,15.1] },
  { symbol: 'BMA',    label: 'Macro',         spark: [5.0,5.1,5.0,5.2,5.15,5.3,5.25,5.4,5.35,5.5,5.45,5.6] },
  { symbol: 'SPY',    label: 'S&P 500',       spark: [475,478,477,480,479,482,481,484,483,486,485,488] },
  { symbol: 'QQQ',    label: 'Nasdaq',        spark: [400,403,402,405,404,407,406,409,408,411,410,413] },
  { symbol: 'AAPL',   label: 'Apple',         spark: [175,177,176,179,178,181,180,183,182,185,184,187] },
  { symbol: 'NVDA',   label: 'NVIDIA',        spark: [800,820,810,840,830,860,850,880,870,900,890,920] },
  { symbol: 'BTCUSD', label: 'Bitcoin',       spark: [62000,63000,62500,64000,63500,65000,64500,66000,65500,67000,66500,68000] },
  { symbol: 'ETHUSD', label: 'Ethereum',      spark: [3200,3250,3220,3300,3280,3350,3320,3400,3380,3450,3420,3500] },
  { symbol: 'XAUUSD', label: 'Oro',           spark: [2320,2330,2325,2340,2335,2350,2345,2360,2355,2370,2365,2380] },
  { symbol: 'UKOIL',  label: 'Brent',         spark: [82,83,82.5,84,83.5,85,84.5,86,85.5,87,86.5,88] },
]

// ─── Detectar si el mercado está abierto ─────────────────────────────────────
function isMarketOpen(symbol: string): boolean {
  const now = new Date()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()
  const day = now.getUTCDay() // 0 = Sun, 6 = Sat
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') return true // crypto 24/7
  if (day === 0 || day === 6) return false                     // fin de semana
  // NYSE: 13:30-20:00 UTC
  const totalMinutes = hour * 60 + minute
  return totalMinutes >= 13 * 60 + 30 && totalMinutes < 20 * 60
}

// ─── Mini sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return <div className="w-14 h-6" />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 56, h = 24
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const color = positive ? '#10b981' : '#ef4444'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="shrink-0">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── TradingView Advanced Chart — con skeleton y fallback ─────────────────────
function TradingViewChart({ symbol, height }: { symbol: string; height: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''
    setStatus('loading')

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true, symbol, interval: 'D',
      timezone: 'America/Argentina/Buenos_Aires',
      theme: 'dark', style: '1', locale: 'es',
      backgroundColor: '#09090b', gridColor: '#27272a',
      hide_top_toolbar: false, hide_legend: false,
      allow_symbol_change: true, save_image: false,
      calendar: false, support_host: 'https://www.tradingview.com',
      toolbar_bg: '#09090b', withdateranges: true,
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
    })
    script.onload = () => setStatus('ready')
    script.onerror = () => setStatus('error')

    const container = document.createElement('div')
    container.className = 'tradingview-widget-container__widget'
    container.style.height = '100%'
    container.style.width = '100%'
    ref.current.style.height = `${height}px`
    ref.current.appendChild(container)
    ref.current.appendChild(script)

    const timeout = setTimeout(() => setStatus(s => s === 'loading' ? 'ready' : s), 5000)
    return () => {
      clearTimeout(timeout)
      if (ref.current) ref.current.innerHTML = ''
    }
  }, [symbol, height, key])

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
          <svg width="200" height="48" viewBox="0 0 200 48" fill="none" className="opacity-20 animate-pulse">
            <polyline points="0,36 25,30 50,20 75,25 100,12 125,16 160,8 200,10"
              stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
            <line x1="0" y1="46" x2="200" y2="46" stroke="#27272a" strokeWidth="1" />
          </svg>
          <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono">
            <div className="w-3 h-3 border border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
            Cargando {symbol}...
          </div>
        </div>
      )}
      {/* Error */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3 z-10">
          <AlertCircle className="w-6 h-6 text-zinc-600" />
          <p className="text-xs text-zinc-500">Error al cargar {symbol}</p>
          <button onClick={() => setKey(k => k + 1)}
            className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-800/40 px-3 py-1.5 rounded-lg hover:border-emerald-600/60 transition-all">
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}
      <div className="tradingview-widget-container w-full" ref={ref}
        style={{ height, opacity: status === 'ready' ? 1 : 0, transition: 'opacity 0.4s ease' }} />
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TerminalClient({ tier, userId, tradingPlan }: TerminalClientProps) {
  const [activeSymbol, setActiveSymbol] = useState('GGAL')
  const [watchlist, setWatchlist] = useState<WatchItem[]>(DEFAULT_WATCHLIST)
  const [activeTab, setActiveTab] = useState<'copilot' | 'mapa' | 'comunidad'>('copilot')
  const [newSymbol, setNewSymbol] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const isPro = tier === 'in_pro' || tier === 'in_pro_plus'

  useEffect(() => {
    if (tradingPlan?.watchlist && Array.isArray(tradingPlan.watchlist)) {
      setWatchlist(tradingPlan.watchlist as WatchItem[])
    }
  }, [tradingPlan])

  function handleSymbolChange(symbol: string) {
    if (symbol === activeSymbol) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveSymbol(symbol)
      setIsTransitioning(false)
    }, 120)
  }

  function addSymbol() {
    if (!newSymbol.trim() || !isPro) return
    const sym = newSymbol.toUpperCase().trim()
    if (watchlist.some(w => w.symbol === sym)) return
    setWatchlist(prev => [{ symbol: sym, label: sym }, ...prev])
    setNewSymbol('')
  }

  function removeSymbol(sym: string) {
    if (!isPro) return
    setWatchlist(prev => prev.filter(w => w.symbol !== sym))
  }

  const marketOpen = isMarketOpen(activeSymbol)

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 57px)' }}>

      {/* ── Watchlist ──────────────────────────────────────────── */}
      <div className="w-52 shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="p-2 border-b border-zinc-800">
          {isPro ? (
            <div className="flex gap-1">
              <input value={newSymbol} onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && addSymbol()} placeholder="+ Ticker"
                className="flex-1 bg-zinc-900 text-white text-xs px-2 py-1.5 rounded-lg border border-zinc-700 outline-none placeholder:text-zinc-600 font-mono" />
              <button onClick={addSymbol}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 rounded-lg text-xs transition-colors">+</button>
            </div>
          ) : (
            <a href="/planes" className="block text-center text-[10px] text-zinc-500 hover:text-zinc-300 py-1 transition-colors">
              🔒 Watchlist propia (Plus)
            </a>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {watchlist.map(item => {
            const isActive = activeSymbol === item.symbol
            const positive = (item.change ?? 0) >= 0
            return (
              <button key={item.symbol} onClick={() => handleSymbolChange(item.symbol)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors group ${
                  isActive
                    ? 'bg-zinc-800/80 border-l-2 border-emerald-500'
                    : 'hover:bg-zinc-900/60 border-l-2 border-transparent'
                }`}>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-mono font-semibold truncate ${isActive ? 'text-white drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'text-zinc-300'}`}>
                    {item.symbol}
                  </p>
                  <p className="text-[9px] text-zinc-600 truncate">{item.label}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.spark && <Sparkline data={item.spark} positive={positive} />}
                  {isPro && (
                    <button onClick={e => { e.stopPropagation(); removeSymbol(item.symbol) }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-xs transition-all ml-1">×</button>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {isPro && (
          <div className="border-t border-zinc-800 p-2">
            <a href="/onboarding" className="block text-center text-[10px] text-emerald-500 hover:text-emerald-400 py-1 transition-colors">
              ✦ Editar mi plan →
            </a>
          </div>
        )}
      </div>

      {/* ── Chart principal ────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Symbol header */}
        <div className="px-4 py-2 border-b border-zinc-800 flex items-center gap-3 shrink-0">
          <span className={`font-mono text-sm font-bold text-white transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          } drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]`}>
            {activeSymbol}
          </span>
          {/* Market status badge */}
          {marketOpen ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ABIERTO
            </span>
          ) : (
            <span className="text-[10px] text-zinc-600 font-medium">CERRADO</span>
          )}
          <span className="text-xs text-zinc-600">TradingView · {tier === 'lector' ? 'Preview' : 'Full'}</span>
          {!isPro && (
            <a href="/planes"
              className="ml-auto text-[10px] text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-full transition-colors">
              Desbloquear → RSI, MACD, dibujos, indicadores
            </a>
          )}
          {/* Quick link to full chart */}
          <a href={`/grafico?s=${activeSymbol}`}
            className={`${isPro ? 'ml-auto' : ''} text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors shrink-0`}>
            ↗ Pantalla completa
          </a>
        </div>

        {/* Chart con transición */}
        <div className={`flex-1 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <TradingViewChart symbol={activeSymbol} height={600} />
        </div>
      </div>

      {/* ── Panel derecho ──────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
        <div className="flex border-b border-zinc-800 shrink-0">
          {([ { id: 'copilot', label: '🤖 IA' }, { id: 'mapa', label: '🌍 Bolsas' }, { id: 'comunidad', label: '👥 Comunidad' } ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-[11px] py-2.5 font-medium transition-colors ${
                activeTab === tab.id ? 'text-white border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}>{tab.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'copilot' && (
            <div className="space-y-3">
              <CopilotBox context="mercados" placeholder={`Analizá ${activeSymbol} para mí`} compact />
              {!isPro && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-zinc-400 mb-2">Copilot limitado en plan gratuito</p>
                  <a href="/planes" className="text-[11px] text-emerald-400 hover:text-emerald-300">Ilimitado en Plus →</a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mapa' && (
            <div>
              {isPro ? <WorldMarketsMap /> : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-2xl mb-2">🌍</p>
                  <p className="text-sm font-semibold text-white mb-1">Mapa de bolsas mundiales</p>
                  <p className="text-[11px] text-zinc-400 mb-3">Disponible en plan Basic y superior</p>
                  <a href="/planes" className="text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 px-3 py-1.5 rounded-lg inline-block">Ver planes →</a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comunidad' && (
            <div>
              {isPro ? (
                <div className="space-y-2">
                  <CommunityFeedRealtime compact onSymbolClick={(sym) => handleSymbolChange(sym)} />
                  <p className="text-[10px] text-zinc-600 text-center mt-3">Feed en tiempo real · Supabase Realtime</p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-2xl mb-2">👥</p>
                  <p className="text-sm font-semibold text-white mb-1">Comunidad de traders</p>
                  <p className="text-[11px] text-zinc-400 mb-1">Mirá qué están operando los demás en tiempo real</p>
                  <p className="text-[11px] text-zinc-500 mb-3">Mini trading floor bancario · Solo Plus</p>
                  <a href="/planes" className="text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 px-3 py-1.5 rounded-lg inline-block">Ver planes →</a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 px-3 py-2 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-zinc-600">
            {new Date().toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })} · Buenos Aires
          </span>
          <span className="text-[10px] text-zinc-600">{isPro ? '● Pro conectado' : '○ Preview'}</span>
        </div>
      </div>
    </div>
  )
}
