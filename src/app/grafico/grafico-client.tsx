'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  symbol: string
}

type ChartStatus = 'loading' | 'ready' | 'error'

// ─── TradingView chart — guaranteed render with fallback ───────────────────────
export default function GraficoClient({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<ChartStatus>('loading')
  const [mountKey, setMountKey] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''
    setStatus('loading')

    // Inject TradingView Advanced Chart widget
    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'America/Argentina/Buenos_Aires',
      theme: 'dark',
      style: '1',
      locale: 'es',
      backgroundColor: '#09090b',
      gridColor: '#27272a',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      toolbar_bg: '#09090b',
      withdateranges: true,
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
    })

    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    widget.style.height = '100%'
    widget.style.width = '100%'

    containerRef.current.appendChild(widget)
    containerRef.current.appendChild(script)

    // Mark as ready after script loads
    script.onload = () => setStatus('ready')
    script.onerror = () => setStatus('error')

    // Timeout fallback — TradingView may not fire onload in all cases
    const timeout = setTimeout(() => {
      setStatus(prev => (prev === 'loading' ? 'ready' : prev))
    }, 5_000)

    return () => {
      clearTimeout(timeout)
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [symbol, mountKey])

  const chartHeight = 'calc(100vh - 120px)'

  return (
    <div className="relative w-full" style={{ height: chartHeight }}>
      {/* Skeleton while loading */}
      {status === 'loading' && (
        <div
          className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none"
          aria-label="Cargando chart"
        >
          <ChartLineSkeleton />
          <div className="flex items-center gap-2 text-zinc-600 text-xs font-mono">
            <div className="w-3.5 h-3.5 border border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
            Cargando {symbol}...
          </div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-10">
          <AlertCircle className="w-8 h-8 text-zinc-600" />
          <div className="text-center">
            <p className="text-sm font-semibold text-white mb-1">
              No se pudo cargar el chart de {symbol}
            </p>
            <p className="text-xs text-zinc-500 mb-4">
              Verificá tu conexión o intentá nuevamente
            </p>
            <button
              onClick={() => setMountKey(k => k + 1)}
              className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 hover:border-emerald-600/60 px-4 py-2 rounded-lg transition-all mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* TradingView container */}
      <div
        ref={containerRef}
        className="tradingview-widget-container w-full h-full"
        style={{ opacity: status === 'ready' ? 1 : 0, transition: 'opacity 0.4s ease' }}
      />
    </div>
  )
}

// ─── Animated skeleton chart line ─────────────────────────────────────────────
function ChartLineSkeleton() {
  return (
    <svg
      width="280"
      height="60"
      viewBox="0 0 280 60"
      fill="none"
      className="opacity-20"
    >
      <polyline
        points="0,45 30,38 60,28 90,32 120,18 150,22 180,12 210,16 250,8 280,12"
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse"
      />
      <line x1="0" y1="58" x2="280" y2="58" stroke="#27272a" strokeWidth="1" />
    </svg>
  )
}
