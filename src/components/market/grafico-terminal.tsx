'use client'

/**
 * GraficoTerminal — Componente cliente para /grafico
 *
 * - Buscador de símbolo con sugerencias
 * - Selector de timeframe
 * - LightweightChart (velas + volumen)
 * - Estadísticas del activo (precio, cambio, high/low)
 * - 100% gratuito, sin login
 */

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Timeframe } from './lightweight-chart'

// Carga dinámica del chart para evitar SSR issues con canvas
const LightweightChart = dynamic(
  () => import('./lightweight-chart').then(m => ({ default: m.LightweightChart })),
  { ssr: false, loading: () => <div className="h-[520px] bg-zinc-900 rounded-xl animate-pulse" /> }
)

interface SymbolSuggestion {
  symbol: string
  label:  string
  type:   string
}

interface GraficoTerminalProps {
  suggestions: SymbolSuggestion[]
}

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1M',  value: '1M'  },
  { label: '3M',  value: '3M'  },
  { label: '6M',  value: '6M'  },
  { label: '1Y',  value: '1Y'  },
  { label: '2Y',  value: '2Y'  },
  { label: 'MAX', value: 'MAX' },
]

const TYPE_COLORS: Record<string, string> = {
  BYMA:   'text-blue-400   bg-blue-500/10   border-blue-800/40',
  NYSE:   'text-purple-400 bg-purple-500/10 border-purple-800/40',
  NASDAQ: 'text-indigo-400 bg-indigo-500/10 border-indigo-800/40',
  ETF:    'text-yellow-400 bg-yellow-500/10 border-yellow-800/40',
  Cripto: 'text-orange-400 bg-orange-500/10 border-orange-800/40',
}

export function GraficoTerminal({ suggestions }: GraficoTerminalProps) {
  const [symbol,    setSymbol]    = useState('GGAL')
  const [timeframe, setTimeframe] = useState<Timeframe>('3M')
  const [query,     setQuery]     = useState('')
  const [showDrop,  setShowDrop]  = useState(false)
  const [inputVal,  setInputVal]  = useState('GGAL')
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrar sugerencias por query
  const filtered = query.length >= 1
    ? suggestions.filter(s =>
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.label.toLowerCase().includes(query.toLowerCase())
      )
    : suggestions

  function selectSymbol(s: SymbolSuggestion) {
    setSymbol(s.symbol)
    setInputVal(s.symbol)
    setQuery('')
    setShowDrop(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase()
    setInputVal(val)
    setQuery(val)
    setShowDrop(true)
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const match = filtered[0]
      if (match) {
        selectSymbol(match)
      } else if (inputVal.length >= 1) {
        // permite cualquier símbolo aunque no esté en la lista
        setSymbol(inputVal)
        setQuery('')
        setShowDrop(false)
      }
    }
    if (e.key === 'Escape') {
      setShowDrop(false)
    }
  }

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.closest('.symbol-search-wrapper')?.contains(e.target as Node)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Símbolo actual en la lista de sugerencias (para mostrar etiqueta)
  const currentSuggestion = suggestions.find(s => s.symbol === symbol)

  return (
    <div className="flex flex-col gap-4">

      {/* Barra de control */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Buscador de símbolo */}
        <div className="symbol-search-wrapper relative">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-emerald-600 transition-colors">
            <span className="text-zinc-500 text-sm">📊</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowDrop(true)}
              placeholder="GGAL, MELI, AAPL..."
              className="bg-transparent text-white font-mono text-sm w-36 outline-none placeholder:text-zinc-600"
            />
            {currentSuggestion && (
              <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded ${TYPE_COLORS[currentSuggestion.type] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                {currentSuggestion.type}
              </span>
            )}
          </div>

          {/* Dropdown */}
          {showDrop && filtered.length > 0 && (
            <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800">
                {filtered.slice(0, 12).map(s => (
                  <button
                    key={s.symbol}
                    onClick={() => selectSymbol(s)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-mono font-semibold text-white">{s.symbol}</span>
                      <span className="text-xs text-zinc-500 ml-2">{s.label}</span>
                    </div>
                    <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded ${TYPE_COLORS[s.type] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                      {s.type}
                    </span>
                  </button>
                ))}
                {query && !filtered.some(s => s.symbol === query) && (
                  <button
                    onClick={() => { setSymbol(inputVal); setShowDrop(false) }}
                    className="w-full px-4 py-2.5 hover:bg-zinc-800 transition-colors text-left text-sm text-zinc-400"
                  >
                    Buscar <span className="font-mono text-white">{inputVal}</span> →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                timeframe === tf.value
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Info símbolo */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-white">{symbol}</span>
          {currentSuggestion && (
            <span className="text-xs text-zinc-500">{currentSuggestion.label}</span>
          )}
        </div>

        {/* Hint */}
        <p className="text-[11px] text-zinc-600 hidden sm:block">
          Escribí cualquier ticker · Enter para buscar
        </p>
      </div>

      {/* Chart */}
      <LightweightChart
        defaultSymbol={symbol}
        defaultTimeframe={timeframe}
        height={520}
        key={`${symbol}-${timeframe}`}
      />

      {/* Sugerencias rápidas */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Activos populares</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s.symbol}
              onClick={() => { setSymbol(s.symbol); setInputVal(s.symbol) }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                symbol === s.symbol
                  ? 'bg-zinc-700 border-zinc-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
              }`}
            >
              <span className="font-mono">{s.symbol}</span>
              <span className="ml-1 text-zinc-600 text-[10px]">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
