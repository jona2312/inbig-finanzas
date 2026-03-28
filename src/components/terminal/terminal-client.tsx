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

const WorldMarketsMap = dynamic(
  () => import('@/components/market/world-markets-map').then(m => ({ default: m.WorldMarketsMap })),
  { ssr: false, loading: () => <div className="h-48 bg-zinc-900 rounded-xl animate-pulse" /> }
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface TerminalClientProps {
  tier:        'lector' | 'in_pro' | 'in_pro_plus'
  userId:      string | null
  tradingPlan: Record<string, unknown> | null
}

interface WatchItem {
  symbol:  string
  label:   string
  price?:  number
  change?: number
}

// ─── Activos default por tier ─────────────────────────────────────────────────

const DEFAULT_WATCHLIST: WatchItem[] = [
  { symbol: 'GGAL',   label: 'Galicia'     },
  { symbol: 'MELI',   label: 'MercadoLibre'},
  { symbol: 'YPF',    label: 'YPF'         },
  { symbol: 'BMA',    label: 'Macro'       },
  { symbol: 'SPY',    label: 'S&P 500'     },
  { symbol: 'QQQ',    label: 'Nasdaq'      },
  { symbol: 'AAPL',   label: 'Apple'       },
  { symbol: 'NVDA',   label: 'NVIDIA'      },
  { symbol: 'BTCUSD', label: 'Bitcoin'     },
  { symbol: 'ETHUSD', label: 'Ethereum'    },
  { symbol: 'XAUUSD', label: 'Oro'         },
  { symbol: 'UKOIL',  label: 'Brent'       },
]

// Feed social simulado — después vendrá de Supabase Realtime
const COMMUNITY_FEED = [
  { user: 'T***a', action: 'está viendo',  symbol: 'XAUUSD', time: 'hace 1min', flag: '🇦🇷' },
  { user: 'M***o', action: 'graficó',      symbol: 'NVDA',   time: 'hace 3min', flag: '🇲🇽' },
  { user: 'J***s', action: 'está viendo',  symbol: 'MELI',   time: 'hace 5min', flag: '🇧🇷' },
  { user: 'C***a', action: 'graficó',      symbol: 'GGAL',   time: 'hace 7min', flag: '🇦🇷' },
  { user: 'R***n', action: 'está viendo',  symbol: 'BTC',    time: 'hace 9min', flag: '🇨🇴' },
  { user: 'P***a', action: 'alertó precio',symbol: 'SPY',    time: 'hace 12min',flag: '🇦🇷' },
  { user: 'D***o', action: 'graficó',      symbol: 'TSLA',   time: 'hace 15min',flag: '🇵🇪' },
]

// ─── TradingView Advanced Chart ───────────────────────────────────────────────

function TradingViewChart({ symbol, height }: { symbol: string; height: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.innerHTML = ''

    const script = document.createElement('script')
    script.src   = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize:          true,
      symbol:            symbol,
      interval:          'D',
      timezone:          'America/Argentina/Buenos_Aires',
      theme:             'dark',
      style:             '1',
      locale:            'es',
      backgroundColor:   '#09090b',
      gridColor:         '#27272a',
      hide_top_toolbar:  false,
      hide_legend:       false,
      allow_symbol_change: true,
      save_image:        false,
      calendar:          false,
      support_host:      'https://www.tradingview.com',
      toolbar_bg:        '#09090b',
      withdateranges:    true,
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
    })

    const container = document.createElement('div')
    container.className   = 'tradingview-widget-container__widget'
    container.style.height= '100%'
    container.style.width = '100%'

    ref.current.style.height = `${height}px`
    ref.current.appendChild(container)
    ref.current.appendChild(script)

    return () => { if (ref.current) ref.current.innerHTML = '' }
  }, [symbol, height])

  return (
    <div className="tradingview-widget-container w-full" ref={ref} style={{ height }} />
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TerminalClient({ tier, userId, tradingPlan }: TerminalClientProps) {
  const [activeSymbol,  setActiveSymbol]  = useState('GGAL')
  const [watchlist,     setWatchlist]     = useState<WatchItem[]>(DEFAULT_WATCHLIST)
  const [activeTab,     setActiveTab]     = useState<'copilot' | 'mapa' | 'comunidad'>('copilot')
  const [newSymbol,     setNewSymbol]     = useState('')
  const isPro = tier === 'in_pro' || tier === 'in_pro_plus'

  // Si tiene trading plan, usar su watchlist propia
  useEffect(() => {
    if (tradingPlan?.watchlist && Array.isArray(tradingPlan.watchlist)) {
      setWatchlist(tradingPlan.watchlist as WatchItem[])
    }
  }, [tradingPlan])

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

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 57px)' }}>

      {/* ── Watchlist lateral izquierda ─────────────────────────────── */}
      <div className="w-48 shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950">

        {/* Agregar símbolo — solo Pro */}
        <div className="p-2 border-b border-zinc-800">
          {isPro ? (
            <div className="flex gap-1">
              <input
                value={newSymbol}
                onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && addSymbol()}
                placeholder="+ Ticker"
                className="flex-1 bg-zinc-900 text-white text-xs px-2 py-1.5 rounded-lg border border-zinc-700 outline-none placeholder:text-zinc-600 font-mono"
              />
              <button onClick={addSymbol} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 rounded-lg text-xs transition-colors">+</button>
            </div>
          ) : (
            <a href="/planes" className="block text-center text-[10px] text-zinc-500 hover:text-zinc-300 py-1 transition-colors">
              🔒 Watchlist propia (Plus)
            </a>
          )}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {watchlist.map(item => (
            <button
              key={item.symbol}
              onClick={() => setActiveSymbol(item.symbol)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors group ${
                activeSymbol === item.symbol
                  ? 'bg-zinc-800 border-l-2 border-emerald-500'
                  : 'hover:bg-zinc-900 border-l-2 border-transparent'
              }`}
            >
              <div>
                <p className="text-xs font-mono font-semibold text-white">{item.symbol}</p>
                <p className="text-[10px] text-zinc-500 truncate max-w-[90px]">{item.label}</p>
              </div>
              {isPro && (
                <button
                  onClick={e => { e.stopPropagation(); removeSymbol(item.symbol) }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-xs transition-all"
                >
                  ×
                </button>
              )}
            </button>
          ))}
        </div>

        {/* Trading plan link */}
        {isPro && (
          <div className="border-t border-zinc-800 p-2">
            <a href="/onboarding" className="block text-center text-[10px] text-emerald-500 hover:text-emerald-400 py-1 transition-colors">
              ✦ Editar mi plan →
            </a>
          </div>
        )}
      </div>

      {/* ── Chart principal — TradingView ───────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Símbolo activo header */}
        <div className="px-4 py-2 border-b border-zinc-800 flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm font-bold text-white">{activeSymbol}</span>
          <span className="text-xs text-zinc-500">TradingView · {tier === 'lector' ? 'Preview' : 'Full'}</span>
          {!isPro && (
            <a href="/planes" className="ml-auto text-[10px] text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-full transition-colors">
              Desbloquear → RSI, MACD, dibujos, indicadores
            </a>
          )}
        </div>

        {/* Chart */}
        <div className="flex-1">
          <TradingViewChart symbol={activeSymbol} height={600} />
        </div>
      </div>

      {/* ── Panel derecho ───────────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-950">

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 shrink-0">
          {([
            { id: 'copilot',   label: '🤖 IA'       },
            { id: 'mapa',      label: '🌍 Bolsas'    },
            { id: 'comunidad', label: '👥 Comunidad' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-[11px] py-2.5 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-emerald-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-3">

          {/* Copilot IA */}
          {activeTab === 'copilot' && (
            <div className="space-y-3">
              <CopilotBox
                context="mercados"
                placeholder={`Analizá ${activeSymbol} para mí`}
                compact
              />
              {!isPro && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-zinc-400 mb-2">Copilot limitado en plan gratuito</p>
                  <a href="/planes" className="text-[11px] text-emerald-400 hover:text-emerald-300">
                    Ilimitado en Plus →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Mapa de bolsas */}
          {activeTab === 'mapa' && (
            <div>
              {isPro ? (
                <WorldMarketsMap />
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-2xl mb-2">🌍</p>
                  <p className="text-sm font-semibold text-white mb-1">Mapa de bolsas mundiales</p>
                  <p className="text-[11px] text-zinc-400 mb-3">Disponible en plan Basic y superior</p>
                  <a href="/planes" className="text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 px-3 py-1.5 rounded-lg inline-block">
                    Ver planes →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Feed comunidad */}
          {activeTab === 'comunidad' && (
            <div>
              {isPro ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Actividad reciente</p>
                  {COMMUNITY_FEED.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors"
                      onClick={() => setActiveSymbol(item.symbol)}
                    >
                      <span className="text-sm">{item.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-zinc-300">
                          <span className="font-semibold text-white">{item.user}</span> {item.action}{' '}
                          <span className="font-mono text-emerald-400">{item.symbol}</span>
                        </p>
                        <p className="text-[10px] text-zinc-600">{item.time}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-zinc-600 text-center mt-3">
                    Feed en tiempo real · Supabase Realtime
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-2xl mb-2">👥</p>
                  <p className="text-sm font-semibold text-white mb-1">Comunidad de traders</p>
                  <p className="text-[11px] text-zinc-400 mb-1">Mirá qué están operando los demás en tiempo real</p>
                  <p className="text-[11px] text-zinc-500 mb-3">Mini trading floor bancario · Solo Plus</p>
                  <a href="/planes" className="text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 px-3 py-1.5 rounded-lg inline-block">
                    Ver planes →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="border-t border-zinc-800 px-3 py-2 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-zinc-600">
            {new Date().toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })} · Buenos Aires
          </span>
          <span className="text-[10px] text-zinc-600">
            {isPro ? '● Pro conectado' : '○ Preview'}
          </span>
        </div>
      </div>
    </div>
  )
}
