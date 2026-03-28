'use client'

/**
 * LightweightChart — Gráfico financiero interactivo con TradingView Lightweight Charts v5
 *
 * - Candlestick + volumen con datos reales de FMP via /api/chart-data
 * - Tema zinc-dark matching INBIG
 * - Selector de símbolo y timeframe
 * - Crosshair con tooltip OHLCV
 * - Sin iframe — 100% en tu código, control total del diseño
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OHLCVBar {
  date:   string
  open:   number
  high:   number
  low:    number
  close:  number
  volume: number
}

interface TooltipState {
  time:   string
  open:   number
  high:   number
  low:    number
  close:  number
  change: number
}

type Timeframe = '1M' | '3M' | '6M' | '1Y' | '2Y'

interface LightweightChartProps {
  defaultSymbol?:    string
  defaultTimeframe?: Timeframe
  symbols?:          { label: string; value: string }[]
  height?:           number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_SYMBOLS = [
  { label: 'GGAL',   value: 'GGAL'   },
  { label: 'YPF',    value: 'YPF'    },
  { label: 'MELI',   value: 'MELI'   },
  { label: 'BMA',    value: 'BMA'    },
  { label: 'BBAR',   value: 'BBAR'   },
  { label: 'LOMA',   value: 'LOMA'   },
  { label: 'GLOB',   value: 'GLOB'   },
  { label: 'TXAR',   value: 'TXAR'   },
  { label: 'S&P500', value: 'SPY'    },
  { label: 'BTC',    value: 'BTCUSD' },
]

const TIMEFRAMES: { label: string; value: Timeframe; days: number }[] = [
  { label: '1M', value: '1M', days: 30  },
  { label: '3M', value: '3M', days: 90  },
  { label: '6M', value: '6M', days: 180 },
  { label: '1A', value: '1Y', days: 365 },
  { label: '2A', value: '2Y', days: 730 },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function LightweightChart({
  defaultSymbol    = 'GGAL',
  defaultTimeframe = '3M',
  symbols          = DEFAULT_SYMBOLS,
  height           = 480,
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<IChartApi | null>(null)
  const candleRef    = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef    = useRef<ISeriesApi<'Histogram'> | null>(null)

  const [symbol,    setSymbol]    = useState(defaultSymbol)
  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [tooltip,   setTooltip]   = useState<TooltipState | null>(null)
  const [lastBar,   setLastBar]   = useState<OHLCVBar | null>(null)

  // ── Inicializar chart (solo una vez) ─────────────────────────────────

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' },
        textColor:  '#a1a1aa',
        fontSize:   11,
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
      },
      grid: {
        vertLines: { color: '#27272a', style: 1 },
        horzLines: { color: '#27272a', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#52525b', labelBackgroundColor: '#27272a' },
        horzLine: { color: '#52525b', labelBackgroundColor: '#27272a' },
      },
      rightPriceScale: {
        borderColor:  '#27272a',
        scaleMargins: { top: 0.08, bottom: 0.28 },
      },
      timeScale: {
        borderColor: '#27272a',
        timeVisible: false,
      },
      width:  container.clientWidth,
      height,
    })

    // Candlestick — v5 API: addSeries(CandlestickSeries, options)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:         '#10b981',
      downColor:       '#ef4444',
      borderUpColor:   '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor:     '#6ee7b7',
      wickDownColor:   '#fca5a5',
    })

    // Histograma de volumen
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color:        '#10b98130',
      priceFormat:  { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    chartRef.current  = chart
    candleRef.current = candleSeries
    volumeRef.current = volumeSeries

    // Crosshair tooltip
    chart.subscribeCrosshairMove(param => {
      if (!param.point || !param.time) { setTooltip(null); return }
      const bar = param.seriesData.get(candleSeries) as CandlestickData | undefined
      if (!bar) { setTooltip(null); return }

      setTooltip({
        time:   typeof param.time === 'string' ? param.time : new Date(Number(param.time) * 1000).toISOString().split('T')[0],
        open:   bar.open,
        high:   bar.high,
        low:    bar.low,
        close:  bar.close,
        change: ((bar.close - bar.open) / bar.open) * 100,
      })
    })

    // Responsive
    const ro = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) chart.applyOptions({ width: entry.contentRect.width })
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current  = null
      candleRef.current = null
      volumeRef.current = null
    }
  }, [height])

  // ── Cargar datos desde /api/chart-data ───────────────────────────────

  const loadData = useCallback(async () => {
    if (!candleRef.current || !volumeRef.current) return

    setLoading(true)
    setError(null)

    try {
      const days = TIMEFRAMES.find(t => t.value === timeframe)?.days ?? 90
      const res  = await fetch(`/api/chart-data?symbol=${symbol}&days=${days}`)

      if (!res.ok) throw new Error(`Error ${res.status}`)

      const bars: OHLCVBar[] = await res.json()

      if (!Array.isArray(bars) || bars.length === 0) {
        throw new Error('Sin datos para este símbolo')
      }

      const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date))

      const candleData: CandlestickData[] = sorted.map(b => ({
        time:  b.date as Time,
        open:  b.open,
        high:  b.high,
        low:   b.low,
        close: b.close,
      }))

      const volumeData: HistogramData[] = sorted.map(b => ({
        time:  b.date as Time,
        value: b.volume,
        color: b.close >= b.open ? '#10b98128' : '#ef444428',
      }))

      candleRef.current?.setData(candleData)
      volumeRef.current?.setData(volumeData)
      chartRef.current?.timeScale().fitContent()

      setLastBar(sorted[sorted.length - 1])
      setTooltip(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [symbol, timeframe])

  useEffect(() => { loadData() }, [loadData])

  // ─── Render ──────────────────────────────────────────────────────────

  const lastChange = lastBar
    ? ((lastBar.close - lastBar.open) / lastBar.open) * 100
    : null

  const displayBar = tooltip ?? (lastBar ? {
    time:   lastBar.date,
    open:   lastBar.open,
    high:   lastBar.high,
    low:    lastBar.low,
    close:  lastBar.close,
    change: lastChange ?? 0,
  } : null)

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden select-none">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-wrap gap-3">
        {/* Precio actual */}
        <div className="flex items-center gap-2.5">
          <span className="text-base font-bold text-white">{symbol}</span>
          {lastBar && (
            <>
              <span className="text-sm text-zinc-200 tabular-nums">
                ${lastBar.close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {lastChange != null && (
                <span className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded ${lastChange >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {lastChange >= 0 ? '▲' : '▼'} {Math.abs(lastChange).toFixed(2)}%
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Símbolo selector */}
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            {symbols.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Timeframe */}
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                  timeframe === tf.value
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OHLCV info bar */}
      {displayBar && (
        <div className="flex items-center gap-4 px-4 py-1.5 bg-zinc-900/60 border-b border-zinc-800/60 text-[11px] tabular-nums flex-wrap">
          <span className="text-zinc-600 text-[10px]">{displayBar.time}</span>
          <span className="text-zinc-400">A <span className="text-zinc-200">{displayBar.open.toFixed(2)}</span></span>
          <span className="text-zinc-400">Max <span className="text-emerald-400">{displayBar.high.toFixed(2)}</span></span>
          <span className="text-zinc-400">Min <span className="text-red-400">{displayBar.low.toFixed(2)}</span></span>
          <span className="text-zinc-400">C <span className="text-zinc-200">{displayBar.close.toFixed(2)}</span></span>
          <span className={`font-medium ${displayBar.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {displayBar.change >= 0 ? '+' : ''}{displayBar.change.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="relative">
        <div ref={containerRef} style={{ height }} />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500 font-medium">Cargando {symbol}...</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70">
            <div className="text-center p-4">
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <button
                onClick={loadData}
                className="text-xs text-zinc-400 hover:text-emerald-400 underline transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-800/50 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">Datos: FMP · Scroll para zoom · Arrastrar para navegar</span>
        <span className="text-[10px] text-zinc-700">TradingView Lightweight Charts v5</span>
      </div>
    </div>
  )
}
